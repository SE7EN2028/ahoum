"""Google OAuth authorization-code exchange.

Frontend gets a short-lived code from Google's consent screen and posts it here.
The backend (holding the client secret) swaps it for tokens, reads the user's
profile, and is the sole issuer of the app's own JWTs.
"""
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile

User = get_user_model()

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class GoogleAuthError(Exception):
    """Raised when the code exchange or userinfo lookup fails."""

    def __init__(self, detail, status=400):
        self.detail = detail
        self.status = status
        super().__init__(detail)


def exchange_code_for_profile(code, redirect_uri):
    """Swap an auth code for the Google profile dict. Raises GoogleAuthError."""
    try:
        token_res = requests.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
    except requests.RequestException:
        raise GoogleAuthError("Could not reach Google.", status=502)

    if token_res.status_code != 200:
        raise GoogleAuthError("Google rejected the authorization code.", status=400)

    access_token = token_res.json().get("access_token")
    if not access_token:
        raise GoogleAuthError("Google did not return an access token.", status=400)

    try:
        info_res = requests.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
    except requests.RequestException:
        raise GoogleAuthError("Could not reach Google.", status=502)

    if info_res.status_code != 200:
        raise GoogleAuthError("Could not read Google profile.", status=400)

    return info_res.json()


def get_or_create_user(info):
    """Find-or-create a user from a Google profile dict. Seeds display_name/avatar
    from Google on first login."""
    email = (info.get("email") or "").lower()
    sub = info.get("sub")
    username = email or f"google_{sub}"

    user, _ = User.objects.get_or_create(
        username=username,
        defaults={"email": email},
    )
    profile, _ = Profile.objects.get_or_create(user=user)

    dirty = []
    if not profile.display_name and info.get("name"):
        profile.display_name = info["name"]
        dirty.append("display_name")
    if dirty:
        profile.save(update_fields=dirty)

    return user


def issue_tokens(user):
    """Mint the app's own access + refresh JWTs for a user."""
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}
