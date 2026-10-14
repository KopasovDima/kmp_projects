from datetime import datetime

from django.http import JsonResponse


def check(_):
    return JsonResponse({
        'time': datetime.now()
    })