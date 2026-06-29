from django.contrib import admin

from .models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "status", "price", "capacity", "starts_at")
    list_filter = ("status",)
    search_fields = ("title", "creator__username", "creator__email")
    date_hierarchy = "starts_at"
