from django.http import JsonResponse


def health(request):
    """Liveness probe hit through nginx at /api/health/."""
    return JsonResponse({"status": "ok", "service": "ahoum-backend"})
