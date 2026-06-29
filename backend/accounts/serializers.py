from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Profile, Role

User = get_user_model()


class MeSerializer(serializers.ModelSerializer):
    """The current user with their profile flattened. Identity fields are
    read-only; profile fields (incl. self-serve role) are editable via PATCH."""

    role = serializers.ChoiceField(
        choices=Role.choices, source="profile.role", required=False
    )
    display_name = serializers.CharField(
        source="profile.display_name", required=False, allow_blank=True, max_length=120
    )
    bio = serializers.CharField(
        source="profile.bio", required=False, allow_blank=True
    )
    avatar = serializers.ImageField(
        source="profile.avatar", required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "display_name", "bio", "avatar"]
        read_only_fields = ["id", "username", "email"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        return instance
