from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "display_name", "verified", "created_at")
    list_filter = ("role", "verified")
    search_fields = ("user__username", "user__email", "display_name")
