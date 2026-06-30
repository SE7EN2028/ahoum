import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from sessions.models import Session

from .services import confirm_checkout, create_checkout_session, fulfill_checkout, mark_cancelled


class CheckoutView(APIView):
    """POST {session_id} -> Stripe Checkout URL to redirect the user to."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        session = get_object_or_404(Session, pk=request.data.get("session_id"))
        url = create_checkout_session(user=request.user, session=session)
        return Response({"checkout_url": url})


class ConfirmView(APIView):
    """Redirect-return verification. POST {checkout_session_id} -> fulfills if paid."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        csid = request.data.get("checkout_session_id")
        if not csid:
            return Response({"detail": "Missing checkout_session_id."}, status=400)
        payment = confirm_checkout(user=request.user, checkout_session_id=csid)
        return Response({
            "status": payment.status if payment else "PENDING",
            "booked": bool(payment and payment.booking_id),
        })


class WebhookView(APIView):
    """Stripe webhook receiver. Verifies the signature, then fulfills/cancels.
    Auth-free and CSRF-exempt (no SessionAuthentication); reads the raw body."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        if not settings.STRIPE_WEBHOOK_SECRET:
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

        sig = request.META.get("HTTP_STRIPE_SIGNATURE")
        try:
            event = stripe.Webhook.construct_event(
                payload=request.body, sig_header=sig, secret=settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception:
            # bad payload or signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        event_type = event["type"]
        obj = event["data"]["object"]

        if event_type == "checkout.session.completed" and obj.get("payment_status") == "paid":
            fulfill_checkout(checkout_session_id=obj["id"], payment_intent_id=obj.get("payment_intent"))
        elif event_type in ("checkout.session.expired", "checkout.session.async_payment_failed"):
            mark_cancelled(obj["id"])

        return Response({"received": True})
