from django.http import JsonResponse

from config.env import env


def handle_request(function):
    def inner_function(*args, **kwargs):
        try:
            response = function(*args, **kwargs)
            status = 200
            if 'status' in response:
                status = response.get('status')
                del response['status']
            return JsonResponse(
                response,
                status=status,
            )
        except (Exception, ) as e:
            if env.DJANGO_DEBUG:
                raise e
            else:
                return JsonResponse(
                    {
                        'error': 'Неизвестная ошибка',
                        'error_info': str(e),
                    },
                    status=500,
                )
    return inner_function