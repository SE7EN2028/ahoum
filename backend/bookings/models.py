from django.db import models  # noqa: F401

# Phase 3: Booking (user FK, session FK, status active/cancelled/completed).
# Capacity guarded in a transaction with select_for_update on the session row.
