from django.conf import settings
from django.db import models


class SessionStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PUBLISHED = "PUBLISHED", "Published"
    CANCELLED = "CANCELLED", "Cancelled"


class Session(models.Model):
    """A bookable session owned by a creator. Only PUBLISHED sessions are public."""

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    capacity = models.PositiveIntegerField(default=1)
    starts_at = models.DateTimeField()
    duration_min = models.PositiveIntegerField(default=60)
    image = models.ImageField(upload_to="sessions/", blank=True, null=True)
    status = models.CharField(
        max_length=16, choices=SessionStatus.choices, default=SessionStatus.DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at"]

    def __str__(self):
        return self.title

    @property
    def active_bookings_count(self):
        # "ACTIVE" is BookingStatus.ACTIVE; literal avoids a circular import.
        return self.bookings.filter(status="ACTIVE").count()

    @property
    def seats_left(self):
        return max(self.capacity - self.active_bookings_count, 0)

    @property
    def is_sold_out(self):
        return self.seats_left <= 0
