#!/bin/sh
python manage.py collectstatic --noinput

gunicorn config.asgi:application -c gunicorn.conf.py
