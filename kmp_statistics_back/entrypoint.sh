#!/bin/sh

python manage.py collectstatic --noinput

gunicorn config.wsgi:application --bind 0.0.0.0:10000
