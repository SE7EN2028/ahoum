from django.conf import settings
from django.db import models


class BookingStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    CANCELLED = "CANCELLED", "Cancelled"
    COMPLETED = "COMPLETED", "Completed"


class Booking(models.Model):
    """A user's reservation of a session. Capacity is enforced server-side in
    Phase 3 via a transaction with select_for_update on the session row."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    # sessions app uses label "catalog" (avoids the django.contrib.sessions clash)
    session = models.ForeignKey(
        "catalog.Session",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    status = models.CharField(
        max_length=16, choices=BookingStatus.choices, default=BookingStatus.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            # one live booking per user per session; cancelled ones don't block rebooking
            models.UniqueConstraint(
                fields=["user", "session"],
                condition=models.Q(status="ACTIVE"),
                name="uniq_active_booking_per_user_session",
            )
        ]

    def __str__(self):
        return f"{self.user} -> {self.session} ({self.status})"
