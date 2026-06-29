import type { CatKey, EnrichedSession } from "../data/content";
import { inr } from "../data/content";
import type { ApiSession } from "./api";

const CAT_LABEL: Record<string, string> = {
  MEDITATION: "Meditation",
  BREATHWORK: "Breathwork",
  YOGA: "Yoga",
  SOUND: "Sound healing",
  COACHING: "Coaching",
};

const fmtDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const fmtTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

/** Map an API session into the enriched card shape the UI renders. */
export function mapSession(s: ApiSession): EnrichedSession {
  const price = Number(s.price);
  const when = new Date(s.starts_at);
  const isOnline = s.mode === "ONLINE";
  const seatsLeft = s.seats_left;
  const soldOut = s.is_sold_out;

  return {
    id: String(s.id),
    title: s.title,
    creator: s.creator.name,
    initials: s.creator.initials,
    verified: s.creator.verified,
    cat: s.category.toLowerCase() as CatKey,
    catLabel: CAT_LABEL[s.category] ?? s.category,
    mode: isOnline ? "online" : "in_person",
    date: fmtDate.format(when),
    time: fmtTime.format(when),
    dur: `${s.duration_min} min`,
    location: s.location,
    price,
    seatsLeft,
    capacity: s.capacity,
    img: s.image || s.image_url,
    isFree: price === 0,
    isPaid: price > 0,
    priceLabel: price === 0 ? "Free" : inr(price),
    soldOut,
    bookable: !soldOut,
    urgent: !soldOut && seatsLeft <= 3,
    roomy: seatsLeft > 3,
    isOnline,
    inPerson: !isOnline,
    modeLabel: isOnline ? "Online" : "In person",
    seatText: soldOut ? "Sold out" : seatsLeft <= 3 ? `Only ${seatsLeft} left` : `${seatsLeft} seats left`,
    imgUrl: s.image || s.image_url,
    creatorId: s.creator.id,
  };
}

/** Friendly message for a booking failure; unavailable sessions read clearly. */
export function bookingErrorMessage(message: string): string {
  if (/sold out|not open|not found|not available/i.test(message)) return "Session not available.";
  return message || "Could not book this session.";
}
