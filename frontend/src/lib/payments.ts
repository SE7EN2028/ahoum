import { api } from "./api";

/** Start a Stripe Checkout for a paid session; returns the hosted checkout URL. */
export function createCheckout(sessionId: number) {
  return api<{ checkout_url: string }>("/payments/checkout/", {
    method: "POST",
    auth: true,
    body: { session_id: sessionId },
  });
}

/** Verify a returned checkout server-side (fulfils the booking if paid). */
export function confirmPayment(checkoutSessionId: string) {
  return api<{ status: string; booked: boolean }>("/payments/confirm/", {
    method: "POST",
    auth: true,
    body: { checkout_session_id: checkoutSessionId },
  });
}
