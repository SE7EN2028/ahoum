from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("checkout_session_id", "user", "session", "amount", "currency", "status", "created_at")
    list_filter = ("status", "provider", "currency")
    search_fields = ("checkout_session_id", "payment_intent_id", "user__email", "session__title")
    readonly_fields = ("created_at", "updated_at")
