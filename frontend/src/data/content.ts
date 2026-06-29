// Seed content ported from the approved design. This drives the UI today and
// is the same shape the backend /api/sessions will return in Phase 3.

export type Mode = "online" | "in_person";
export type CatKey = "meditation" | "breathwork" | "yoga" | "sound" | "coaching";

export interface Session {
  id: string;
  title: string;
  creator: string;
  initials: string;
  verified: boolean;
  cat: CatKey;
  catLabel: string;
  mode: Mode;
  date: string;
  time: string;
  dur: string;
  location: string;
  price: number;
  seatsLeft: number;
  capacity: number;
  img: string;
}

export const sessions: Session[] = [
  { id: "sound-deep-rest", title: "Sound Bath for Deep Rest", creator: "Maya Rivera", initials: "MR", verified: true, cat: "sound", catLabel: "Sound healing", mode: "online", date: "Tonight", time: "7:00 PM", dur: "60 min", location: "Online", price: 600, seatsLeft: 12, capacity: 30, img: "1593811167562-9cef47bfc4d7" },
  { id: "morning-vinyasa", title: "Morning Vinyasa Flow", creator: "Daniel Okafor", initials: "DO", verified: true, cat: "yoga", catLabel: "Yoga", mode: "in_person", date: "Sat 6 Jun", time: "7:00 AM", dur: "75 min", location: "Bandra, Mumbai", price: 0, seatsLeft: 4, capacity: 18, img: "1588286840104-8957b019727f" },
  { id: "breath-stillness", title: "Breath & Stillness", creator: "Aanya Kapoor", initials: "AK", verified: true, cat: "meditation", catLabel: "Meditation", mode: "online", date: "Sun 7 Jun", time: "6:30 AM", dur: "45 min", location: "Online", price: 400, seatsLeft: 20, capacity: 40, img: "1508672019048-805c876b67e2" },
  { id: "pranayama-calm", title: "Pranayama for Calm", creator: "Leo Marsh", initials: "LM", verified: false, cat: "breathwork", catLabel: "Breathwork", mode: "online", date: "Wed 4 Jun", time: "8:00 PM", dur: "50 min", location: "Online", price: 350, seatsLeft: 9, capacity: 25, img: "1474418397713-7ede21d49118" },
  { id: "restorative-evening", title: "Restorative Evening Yoga", creator: "Priya Nair", initials: "PN", verified: true, cat: "yoga", catLabel: "Yoga", mode: "in_person", date: "Fri 5 Jun", time: "6:00 PM", dur: "60 min", location: "Indiranagar, Bengaluru", price: 500, seatsLeft: 2, capacity: 14, img: "1518611012118-696072aa579a" },
  { id: "crystal-bowls", title: "Crystal Singing Bowls", creator: "Maya Rivera", initials: "MR", verified: true, cat: "sound", catLabel: "Sound healing", mode: "online", date: "Sat 6 Jun", time: "5:00 PM", dur: "60 min", location: "Online", price: 600, seatsLeft: 0, capacity: 30, img: "1528319725582-ddc096101511" },
  { id: "walking-meditation", title: "Walking Meditation", creator: "Aanya Kapoor", initials: "AK", verified: true, cat: "meditation", catLabel: "Meditation", mode: "in_person", date: "Sun 7 Jun", time: "7:30 AM", dur: "40 min", location: "Cubbon Park, Bengaluru", price: 0, seatsLeft: 11, capacity: 20, img: "1488646953014-85cb44e25828" },
  { id: "inner-compass", title: "Inner Compass Coaching", creator: "Daniel Okafor", initials: "DO", verified: false, cat: "coaching", catLabel: "Coaching", mode: "online", date: "Mon 8 Jun", time: "6:00 PM", dur: "45 min", location: "Online", price: 900, seatsLeft: 6, capacity: 10, img: "1604881988758-f76ad2f7aac1" },
];

export interface Practice {
  k: CatKey;
  l: string;
  d: string;
  count: number;
  from: number;
  dur: string;
  img: string;
}

export const practices: Practice[] = [
  { k: "meditation", l: "Meditation", d: "Settle a busy mind with guided stillness, body scans and breath awareness. Calm you can return to.", count: 42, from: 400, dur: "45 min avg", img: "1508672019048-805c876b67e2" },
  { k: "breathwork", l: "Breathwork", d: "Simple, structured breathing to steady the nervous system and lift low energy. Felt within minutes.", count: 18, from: 350, dur: "50 min avg", img: "1474418397713-7ede21d49118" },
  { k: "yoga", l: "Yoga", d: "Move with ease, from gentle restorative flows to grounding morning practice for every level.", count: 56, from: 0, dur: "60 min avg", img: "1588286840104-8957b019727f" },
  { k: "sound", l: "Sound healing", d: "Rest in the resonance of bowls and gongs. Deep relaxation with nothing asked of you but to listen.", count: 23, from: 600, dur: "60 min avg", img: "1593811167562-9cef47bfc4d7" },
  { k: "coaching", l: "Coaching", d: "Walk with a guide through change, habits and clarity in focused one-to-one sessions.", count: 15, from: 900, dur: "45 min avg", img: "1604881988758-f76ad2f7aac1" },
];

export const faqs = [
  { q: "Can I book a private one-to-one session?", a: "Yes. Many teachers offer private sessions alongside their group ones. Open a teacher’s profile and choose a one-to-one slot, or ask them directly through Ahoum." },
  { q: "How long is each session?", a: "Most sessions run 40 to 75 minutes. The exact length is shown on every session card and on the detail page before you book." },
  { q: "Can beginners join these sessions?", a: "Absolutely. Sessions are labelled by level, and teachers welcome first-timers. Look for the beginner-friendly tag if you are just starting out." },
  { q: "Do you have in-person locations?", a: "Yes. Alongside online sessions, teachers host in person across Mumbai, Bengaluru and more. Use the In person filter to find one near you." },
  { q: "What if I need to cancel?", a: "Cancel up to two hours before a session for a full refund, right from your dashboard. Free sessions can be released any time so someone else can take the seat." },
];

export const testimonials = [
  { q: "Being part of a guided practice has supported my daily routine in meaningful ways, and made staying consistent feel genuinely easy.", n: "Savannah Watson", r: "Member since 2024", img: "1488716820095-cbe80883c496" },
  { q: "I booked a sound bath on a hard night and slept properly for the first time in weeks. The teachers really hold the space.", n: "Isha Menon", r: "Member · Mumbai", img: "1494790108377-be9c29b29330" },
  { q: "Ten quiet minutes of breathwork before work changed my whole morning. I did not expect a marketplace to feel this calm.", n: "Rohan Kapoor", r: "Member · Pune", img: "1607990281513-2c110a25bd8c" },
];

export const statData: Record<string, { h: string; bars: number[] }> = {
  all: { h: "16h", bars: [42, 68, 34, 82, 56, 72, 48] },
  meditation: { h: "7h", bars: [60, 38, 72, 30, 55, 46, 66] },
  yoga: { h: "6h", bars: [34, 72, 46, 62, 40, 76, 50] },
  sound: { h: "3h", bars: [52, 30, 62, 40, 72, 36, 56] },
};

export const statTabs: [string, string][] = [["all", "All"], ["meditation", "Meditation"], ["yoga", "Yoga"], ["sound", "Sound"]];
export const catDefs: [string, string][] = [["all", "All"], ["meditation", "Meditation"], ["breathwork", "Breathwork"], ["yoga", "Yoga"], ["sound", "Sound healing"], ["coaching", "Coaching"]];
export const modeDefs: [string, string][] = [["all", "All"], ["online", "Online"], ["in_person", "In person"]];

export const featTags = ["Meditation", "Breathwork", "Sound healing", "Yoga", "Coaching", "One to one", "Beginner friendly", "In person"];
export const footerPractices = ["Meditation", "Breathwork", "Yoga", "Sound healing", "Coaching"];

// ---- derive helpers ----
export const img = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop`;

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export interface EnrichedSession extends Session {
  isFree: boolean;
  isPaid: boolean;
  priceLabel: string;
  soldOut: boolean;
  bookable: boolean;
  urgent: boolean;
  roomy: boolean;
  isOnline: boolean;
  inPerson: boolean;
  modeLabel: string;
  seatText: string;
  imgUrl: string;
}

export function enrich(s: Session): EnrichedSession {
  return {
    ...s,
    isFree: s.price === 0,
    isPaid: s.price > 0,
    priceLabel: s.price === 0 ? "Free" : inr(s.price),
    soldOut: s.seatsLeft <= 0,
    bookable: s.seatsLeft > 0,
    urgent: s.seatsLeft > 0 && s.seatsLeft <= 3,
    roomy: s.seatsLeft > 3,
    isOnline: s.mode === "online",
    inPerson: s.mode === "in_person",
    modeLabel: s.mode === "online" ? "Online" : "In person",
    seatText: s.seatsLeft <= 0 ? "Sold out" : s.seatsLeft <= 3 ? `Only ${s.seatsLeft} left` : `${s.seatsLeft} seats left`,
    imgUrl: img(s.img, 640, 440),
  };
}
