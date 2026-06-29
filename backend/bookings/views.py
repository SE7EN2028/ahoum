from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Booking, BookingStatus
from .serializers import BookingSerializer
from .services import book_session, cancel_booking


class BookingViewSet(viewsets.ModelViewSet):
    """A user's own bookings. Create goes through the booking service so the
    capacity rule is enforced under a row lock; no PUT/PATCH/DELETE."""

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post"]

    def get_queryset(self):
        qs = (
            Booking.objects.filter(user=self.request.user)
            .select_related("session", "session__creator", "session__creator__profile")
            .order_by("-created_at")
        )
        kind = self.request.query_params.get("status")
        now = timezone.now()
        if kind == "active":
            qs = qs.filter(status=BookingStatus.ACTIVE, session__starts_at__gte=now)
        elif kind == "past":
            qs = qs.filter(
                Q(status__in=[BookingStatus.CANCELLED, BookingStatus.COMPLETED])
                | Q(session__starts_at__lt=now)
            )
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = book_session(user=request.user, session=serializer.validated_data["session"])
        return Response(self.get_serializer(booking).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        booking = self.get_object()  # get_queryset scopes this to the requester
        cancel_booking(booking=booking)
        return Response(self.get_serializer(booking).data)
