from django.conf import settings
from django.db import models


class PaymentStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    PAID = "PAID", "Paid"
    FAILED = "FAILED", "Failed"
    CANCELLED = "CANCELLED", "Cancelled"


class Payment(models.Model):
    """A Stripe payment for a session booking. Created PENDING when checkout
    starts; flipped to PAID (and linked to a Booking) only after Stripe verifies
    the payment via webhook or redirect-confirm."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments"
    )
    session = models.ForeignKey(
        "catalog.Session", on_delete=models.CASCADE, related_name="payments"
    )
    booking = models.OneToOneField(
        "bookings.Booking",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payment",
    )

    provider = models.CharField(max_length=20, default="stripe")
    checkout_session_id = models.CharField(max_length=255, unique=True)
    payment_intent_id = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="inr")
    status = models.CharField(
        max_length=16, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.provider}:{self.checkout_session_id} ({self.status})"
