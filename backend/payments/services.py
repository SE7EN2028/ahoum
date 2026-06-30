"""Stripe payment logic. Bookings for paid sessions are created ONLY here, after
Stripe has verified the payment (via webhook or redirect-confirm). Both entry
points funnel into `fulfill_checkout`, which is idempotent."""
from decimal import Decimal

import stripe
from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from bookings.models import Booking, BookingStatus
from sessions.models import Session, SessionStatus

from .models import Payment, PaymentStatus


def _client():
    if not settings.STRIPE_SECRET_KEY:
        raise ValidationError({"detail": "Payments are not configured on the server."})
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def _assert_bookable(user, session: Session):
    """Same guards as a free booking, checked before sending the user to Stripe."""
    if session.status != SessionStatus.PUBLISHED:
        raise ValidationError({"detail": "This session is not open for booking."})
    if session.creator_id == user.id:
        raise ValidationError({"detail": "You cannot book your own session."})
    if Booking.objects.filter(user=user, session=session, status=BookingStatus.ACTIVE).exists():
        raise ValidationError({"detail": "You already have an active booking for this session."})
    if session.seats_left <= 0:
        raise ValidationError({"detail": "This session is sold out."})


def create_checkout_session(*, user, session: Session) -> str:
    """Create a Stripe Checkout Session and a PENDING Payment row. Returns the
    hosted checkout URL the frontend redirects to."""
    s = _client()
    _assert_bookable(user, session)

    base = settings.FRONTEND_BASE_URL.rstrip("/")
    checkout = s.checkout.Session.create(
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": settings.STRIPE_CURRENCY,
                "product_data": {"name": session.title},
                "unit_amount": int(Decimal(session.price) * 100),  # smallest currency unit
            },
            "quantity": 1,
        }],
        success_url=f"{base}/sessions/{session.id}?payment=success&cs={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{base}/sessions/{session.id}?payment=cancelled",
        client_reference_id=str(user.id),
        metadata={"session_id": str(session.id), "user_id": str(user.id)},
    )

    Payment.objects.create(
        user=user,
        session=session,
        amount=session.price,
        currency=settings.STRIPE_CURRENCY,
        checkout_session_id=checkout.id,
        status=PaymentStatus.PENDING,
    )
    return checkout.url


@transaction.atomic
def fulfill_checkout(*, checkout_session_id: str, payment_intent_id: str | None = None) -> Payment | None:
    """Idempotently turn a verified-paid checkout into a confirmed booking.
    Locks the session row so the capacity rule still holds."""
    try:
        payment = Payment.objects.select_for_update().get(checkout_session_id=checkout_session_id)
    except Payment.DoesNotExist:
        return None

    if payment.status == PaymentStatus.PAID:
        return payment  # already fulfilled

    session = Session.objects.select_for_update().get(pk=payment.session_id)
    booking = Booking.objects.filter(
        user_id=payment.user_id, session=session, status=BookingStatus.ACTIVE
    ).first()

    if booking is None:
        taken = Booking.objects.filter(session=session, status=BookingStatus.ACTIVE).count()
        if taken < session.capacity:
            booking = Booking.objects.create(
                user_id=payment.user_id, session=session, status=BookingStatus.ACTIVE, is_paid=True
            )
        # if sold out by now (rare race), the payment is still recorded PAID with no
        # booking; a refund would be handled out-of-band.
    if booking is not None and not booking.is_paid:
        booking.is_paid = True
        booking.save(update_fields=["is_paid"])

    payment.status = PaymentStatus.PAID
    if payment_intent_id:
        payment.payment_intent_id = payment_intent_id
    payment.booking = booking
    payment.save()
    return payment


def mark_cancelled(checkout_session_id: str):
    """Checkout expired/cancelled — release the PENDING payment. No booking is made."""
    Payment.objects.filter(
        checkout_session_id=checkout_session_id, status=PaymentStatus.PENDING
    ).update(status=PaymentStatus.CANCELLED)


def confirm_checkout(*, user, checkout_session_id: str) -> Payment | None:
    """Redirect-return safety net: re-fetch the session from Stripe and fulfill if
    it is paid. Verifies the checkout belongs to the requesting user."""
    s = _client()
    checkout = s.checkout.Session.retrieve(checkout_session_id)
    if str(checkout.get("metadata", {}).get("user_id")) != str(user.id):
        raise PermissionDenied("This checkout does not belong to you.")
    if checkout.get("payment_status") == "paid":
        return fulfill_checkout(
            checkout_session_id=checkout_session_id,
            payment_intent_id=checkout.get("payment_intent"),
        )
    return None
