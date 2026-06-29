from django.urls import path

from .views import DevLoginView, GoogleAuthView, MeView

urlpatterns = [
    path("auth/google/", GoogleAuthView.as_view(), name="auth_google"),
    path("auth/dev-login/", DevLoginView.as_view(), name="auth_dev_login"),
    path("me/", MeView.as_view(), name="me"),
]
