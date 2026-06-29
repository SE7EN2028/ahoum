"""Seed demo creators + a published catalog so a fresh `docker compose up` shows
a populated marketplace. Idempotent: safe to run repeatedly."""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import Profile, Role
from sessions.models import Category, Mode, Session, SessionStatus

User = get_user_model()

CREATORS = [
    # email, display name, verified
    ("maya@ahoum.local", "Maya Rivera", True),
    ("daniel@ahoum.local", "Daniel Okafor", True),
    ("aanya@ahoum.local", "Aanya Kapoor", True),
    ("leo@ahoum.local", "Leo Marsh", False),
    ("priya@ahoum.local", "Priya Nair", True),
]

# title, creator email, category, mode, location, price, capacity, duration, image id, day offset
SESSIONS = [
    ("Sound Bath for Deep Rest", "maya@ahoum.local", Category.SOUND, Mode.ONLINE, "Online", 600, 30, 60, "1593811167562-9cef47bfc4d7", 1),
    ("Morning Vinyasa Flow", "daniel@ahoum.local", Category.YOGA, Mode.IN_PERSON, "Bandra, Mumbai", 0, 18, 75, "1588286840104-8957b019727f", 3),
    ("Breath & Stillness", "aanya@ahoum.local", Category.MEDITATION, Mode.ONLINE, "Online", 400, 40, 45, "1508672019048-805c876b67e2", 4),
    ("Pranayama for Calm", "leo@ahoum.local", Category.BREATHWORK, Mode.ONLINE, "Online", 350, 25, 50, "1474418397713-7ede21d49118", 2),
    ("Restorative Evening Yoga", "priya@ahoum.local", Category.YOGA, Mode.IN_PERSON, "Indiranagar, Bengaluru", 500, 14, 60, "1518611012118-696072aa579a", 5),
    ("Crystal Singing Bowls", "maya@ahoum.local", Category.SOUND, Mode.ONLINE, "Online", 600, 30, 60, "1528319725582-ddc096101511", 6),
    ("Walking Meditation", "aanya@ahoum.local", Category.MEDITATION, Mode.IN_PERSON, "Cubbon Park, Bengaluru", 0, 20, 40, "1488646953014-85cb44e25828", 7),
    ("Inner Compass Coaching", "daniel@ahoum.local", Category.COACHING, Mode.ONLINE, "Online", 900, 10, 45, "1604881988758-f76ad2f7aac1", 8),
]

DESCRIPTION = "A live, guided session held by your teacher. Come as you are; everything you need is a quiet spot and a few minutes."


def image_url(img_id: str) -> str:
    return f"https://images.unsplash.com/photo-{img_id}?w=640&h=440&fit=crop"


class Command(BaseCommand):
    help = "Seed demo creators and a published session catalog."

    def handle(self, *args, **options):
        now = timezone.now()
        creators = {}

        for email, name, verified in CREATORS:
            user, _ = User.objects.get_or_create(username=email, defaults={"email": email})
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.role = Role.CREATOR
            profile.display_name = name
            profile.verified = verified
            profile.save(update_fields=["role", "display_name", "verified"])
            creators[email] = user

        created = 0
        for title, email, category, mode, location, price, capacity, duration, img_id, day in SESSIONS:
            _, was_created = Session.objects.update_or_create(
                creator=creators[email],
                title=title,
                defaults={
                    "description": DESCRIPTION,
                    "category": category,
                    "mode": mode,
                    "location": location,
                    "price": price,
                    "capacity": capacity,
                    "duration_min": duration,
                    "image_url": image_url(img_id),
                    "starts_at": now + timedelta(days=day, hours=3),
                    "status": SessionStatus.PUBLISHED,
                },
            )
            created += int(was_created)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(creators)} creators and {len(SESSIONS)} sessions ({created} new)."
        ))
