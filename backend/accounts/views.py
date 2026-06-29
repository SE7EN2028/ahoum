from django.conf import settings
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile, Role
from .oauth import GoogleAuthError, exchange_code_for_profile, get_or_create_user, issue_tokens
from .serializers import MeSerializer

User = get_user_model()


class GoogleAuthView(APIView):
    """POST {code, redirect_uri?} -> exchanges the Google auth code and returns
    the app's own {access, refresh, user}."""

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(request=None, responses=MeSerializer)
    def post(self, request):
        code = request.data.get("code")
        redirect_uri = request.data.get("redirect_uri") or settings.OAUTH_REDIRECT_URI
        if not code:
            return Response({"detail": "Missing 'code'."}, status=400)
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return Response(
                {"detail": "Google OAuth is not configured on the server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            info = exchange_code_for_profile(code, redirect_uri)
        except GoogleAuthError as exc:
            return Response({"detail": exc.detail}, status=exc.status)

        user = get_or_create_user(info)
        tokens = issue_tokens(user)
        return Response(
            {**tokens, "user": MeSerializer(user, context={"request": request}).data}
        )


class DevLoginView(APIView):
    """DEBUG-only shortcut: issue JWTs for an arbitrary email so the app can be
    tested end-to-end without real Google credentials. 404 when DEBUG is off."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        if not settings.DEBUG:
            return Response({"detail": "Not found."}, status=404)
        email = (request.data.get("email") or "demo@ahoum.local").lower()
        role = request.data.get("role")

        user, _ = User.objects.get_or_create(username=email, defaults={"email": email})
        profile, _ = Profile.objects.get_or_create(user=user)
        if role in (Role.USER, Role.CREATOR):
            profile.role = role
            profile.save(update_fields=["role"])

        tokens = issue_tokens(user)
        return Response(
            {**tokens, "user": MeSerializer(user, context={"request": request}).data}
        )


class MeView(generics.RetrieveUpdateAPIView):
    """GET / PATCH the current user's profile (display_name, avatar, bio, role)."""

    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user
