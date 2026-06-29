from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsCreator, IsOwnerOrReadOnly
from bookings.serializers import BookingAttendeeSerializer

from .models import Session, SessionStatus
from .serializers import SessionSerializer


class SessionViewSet(viewsets.ModelViewSet):
    """Public read of published sessions; creator-only write of own sessions."""

    serializer_class = SessionSerializer
    owner_field = "creator"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsCreator(), IsOwnerOrReadOnly()]

    def get_queryset(self):
        qs = Session.objects.select_related("creator", "creator__profile")
        user = self.request.user
        params = self.request.query_params

        if self.action == "list" and params.get("mine") in ("1", "true") and user.is_authenticated:
            qs = qs.filter(creator=user)
        elif self.action == "list":
            qs = qs.filter(status=SessionStatus.PUBLISHED)
        else:
            # detail actions: owner may reach their own drafts too
            visible = Q(status=SessionStatus.PUBLISHED)
            if user.is_authenticated:
                visible |= Q(creator=user)
            qs = qs.filter(visible)

        category = params.get("category")
        mode = params.get("mode")
        q = params.get("q")
        if category and category != "all":
            qs = qs.filter(category=category.upper())
        if mode and mode != "all":
            qs = qs.filter(mode=mode.upper())
        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(creator__profile__display_name__icontains=q)
                | Q(creator__username__icontains=q)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def bookings(self, request, pk=None):
        """Attendee list for the session's owner."""
        session = self.get_object()
        if session.creator_id != request.user.id:
            raise PermissionDenied("Only the session owner can view its bookings.")
        qs = session.bookings.select_related("user", "user__profile").order_by("-created_at")
        return Response(BookingAttendeeSerializer(qs, many=True).data)
