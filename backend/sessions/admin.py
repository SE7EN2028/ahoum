from django.contrib import admin

from .models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "category", "mode", "status", "price", "capacity", "starts_at")
    list_filter = ("status", "category", "mode")
    search_fields = ("title", "creator__username", "creator__email")
    date_hierarchy = "starts_at"
