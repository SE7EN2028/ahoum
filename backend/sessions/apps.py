from django.apps import AppConfig


class SessionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "sessions"
    # label must differ from django.contrib.sessions ("sessions")
    label = "catalog"
