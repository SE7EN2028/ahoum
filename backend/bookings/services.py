"""Booking domain logic. Kept in one place so the API layer stays thin and the
capacity rule can never be bypassed."""
from django.db import transaction
from rest_framework.exceptions import ValidationError

from sessions.models import Session, SessionStatus

from .models import Booking, BookingStatus


@transaction.atomic
def book_session(*, user, session: Session) -> Booking:
    """Reserve a seat. Locks the session row so two concurrent bookings cannot
    oversell the last seat. Raises ValidationError on any rule violation."""
    # re-fetch under a row lock; the passed-in instance may be stale
    session = Session.objects.select_for_update().get(pk=session.pk)

    if session.status != SessionStatus.PUBLISHED:
        raise ValidationError({"session_id": "This session is not open for booking."})
    if session.creator_id == user.id:
        raise ValidationError({"session_id": "You cannot book your own session."})
    if Booking.objects.filter(user=user, session=session, status=BookingStatus.ACTIVE).exists():
        raise ValidationError({"detail": "You already have an active booking for this session."})

    taken = Booking.objects.filter(session=session, status=BookingStatus.ACTIVE).count()
    if taken >= session.capacity:
        raise ValidationError({"detail": "This session is sold out."})

    return Booking.objects.create(user=user, session=session, status=BookingStatus.ACTIVE)


def cancel_booking(*, booking: Booking) -> Booking:
    """Release an active booking. Idempotency is the caller's concern."""
    if booking.status != BookingStatus.ACTIVE:
        raise ValidationError({"detail": "Only active bookings can be cancelled."})
    booking.status = BookingStatus.CANCELLED
    booking.save(update_fields=["status", "updated_at"])
    return booking
