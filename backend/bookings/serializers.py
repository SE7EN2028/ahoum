from rest_framework import serializers

from sessions.models import Session
from sessions.serializers import SessionSerializer

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    """Read: nested session + status. Write: just session_id."""

    session = SessionSerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(), source="session", write_only=True
    )

    class Meta:
        model = Booking
        fields = ["id", "session", "session_id", "status", "created_at"]
        read_only_fields = ["id", "session", "status", "created_at"]


class BookingAttendeeSerializer(serializers.ModelSerializer):
    """Booking as seen by the session's creator: who booked, not the session."""

    user = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ["id", "user", "status", "created_at"]

    def get_user(self, obj) -> dict:
        profile = getattr(obj.user, "profile", None)
        name = (profile.display_name if profile and profile.display_name else obj.user.username)
        return {"id": obj.user_id, "name": name, "email": obj.user.email}
