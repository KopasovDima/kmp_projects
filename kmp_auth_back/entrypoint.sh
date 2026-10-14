#!/bin/sh

python manage.py collectstatic --noinput

gunicorn config.wsgi:application --bind 0.0.0.0:20001 --workers 5
