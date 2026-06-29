from django.conf import settings
from django.db import models


class Role(models.TextChoices):
    USER = "USER", "User"
    CREATOR = "CREATOR", "Creator"


class Profile(models.Model):
    """One-to-one extension of the auth user. Role is the security boundary,
    re-checked server-side on every creator action."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.USER)
    display_name = models.CharField(max_length=120, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True)
    verified = models.BooleanField(default=False)  # verified teacher badge
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} ({self.role})"

    @property
    def is_creator(self):
        return self.role == Role.CREATOR
