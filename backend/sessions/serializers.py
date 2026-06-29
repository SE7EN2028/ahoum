from rest_framework import serializers

from .models import Category, Mode, Session


def _initials(name: str) -> str:
    parts = [p for p in name.split() if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return name[:2].upper()


class CreatorField(serializers.Serializer):
    """Compact creator block used on session cards."""

    id = serializers.IntegerField()
    name = serializers.CharField()
    initials = serializers.CharField()
    verified = serializers.BooleanField()


class SessionSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    seats_left = serializers.IntegerField(read_only=True)
    is_sold_out = serializers.BooleanField(read_only=True)
    image = serializers.ImageField(read_only=True)
    # accept the frontend's lowercase keys ("yoga", "in_person") on write
    category = serializers.CharField(required=False)
    mode = serializers.CharField(required=False)

    class Meta:
        model = Session
        fields = [
            "id", "title", "description", "category", "mode", "location",
            "price", "capacity", "starts_at", "duration_min",
            "image", "image_url", "status",
            "seats_left", "is_sold_out", "creator", "created_at",
        ]
        read_only_fields = ["id", "image", "seats_left", "is_sold_out", "creator", "created_at"]

    def get_creator(self, obj) -> dict:
        profile = getattr(obj.creator, "profile", None)
        name = (profile.display_name if profile and profile.display_name else obj.creator.username)
        return {
            "id": obj.creator_id,
            "name": name,
            "initials": _initials(name),
            "verified": bool(profile and profile.verified),
        }

    def validate_category(self, value):
        norm = value.replace("-", "_").upper()
        if norm not in Category.values:
            raise serializers.ValidationError(f"Invalid category. Choose from: {', '.join(Category.values)}.")
        return norm

    def validate_mode(self, value):
        norm = value.replace("-", "_").upper()
        if norm not in Mode.values:
            raise serializers.ValidationError(f"Invalid mode. Choose from: {', '.join(Mode.values)}.")
        return norm

    def validate_capacity(self, value):
        if value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value
