from django.urls import path

from .views import CheckoutView, ConfirmView, WebhookView

urlpatterns = [
    path("payments/checkout/", CheckoutView.as_view(), name="payments_checkout"),
    path("payments/confirm/", ConfirmView.as_view(), name="payments_confirm"),
    path("payments/webhook/", WebhookView.as_view(), name="payments_webhook"),
]
