#!/usr/bin/env sh
set -e

echo "[entrypoint] applying migrations..."
python manage.py migrate --noinput

echo "[entrypoint] collecting static..."
python manage.py collectstatic --noinput

if [ "$DJANGO_DEBUG" = "1" ]; then
    echo "[entrypoint] starting Django dev server on :8000"
    exec python manage.py runserver 0.0.0.0:8000
else
    echo "[entrypoint] starting gunicorn on :8000"
    exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
fi
