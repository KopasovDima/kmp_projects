import time
from http import HTTPStatus

from django.http import JsonResponse, FileResponse
from django.views.decorators.http import require_http_methods

from config.env import env
from config.logger import log_error, log_info
from is_kmp.exceptions.auth_exception import AuthException
from is_kmp.exceptions.bad_request_exception import BadRequestException
from is_kmp.exceptions.forbidden_exception import ForbiddenException
from is_kmp.exceptions.not_found_exception import NotFoundException
from is_kmp.utils.auth_service import verify_user_auth
from is_kmp.utils.permissions import check_admin, check_role, check_have_access_to_company


def get_client_ip(request):
    return request.META.get('HTTP_X_REAL_IP') or request.META.get('REMOTE_ADDR')


def handle_request(function):
    def inner_function(request, *args, **kwargs):
        request_start_time = time.time()
        request_method = request.method
        request_path = request.get_full_path()
        request_user_ip = get_client_ip(request)
        response_status = None
        request_user_id = None

        try:
            response = function(request, *args, **kwargs)

            if type(response) == tuple:
                response, request_user_id = response

            if type(response) == FileResponse:
                return response

            if type(response) == str:
                response = {
                    'message': response,
                }

            status = HTTPStatus.OK
            if 'status' in response:
                status = response.get('status')
                del response['status']

            response_status = status

            return JsonResponse(
                response,
                status=status,
            )
        except AuthException as e:
            message = 'Необходима авторизация'
            if e.message:
                message = e.message + ' - ' + message.lower()
            response_status = HTTPStatus.UNAUTHORIZED
            return JsonResponse(
                {
                    'error': message,
                },
                status=response_status,
            )
        except ForbiddenException as e:
            response_status = HTTPStatus.FORBIDDEN
            return JsonResponse(
                {
                    'error': e.message,
                },
                status=response_status,
            )
        except BadRequestException as e:
            response_status = HTTPStatus.BAD_REQUEST
            return JsonResponse(
                {
                    'error': e.message,
                },
                status=response_status,
            )
        except NotFoundException as e:
            response_status = HTTPStatus.NOT_FOUND
            return JsonResponse(
                {
                    'error': e.message,
                },
                status=response_status,
            )
        except (Exception,) as e:
            response_status = HTTPStatus.INTERNAL_SERVER_ERROR
            if env.DJANGO_DEBUG:
                raise e
            else:
                return JsonResponse(
                    {
                        'error': 'Неизвестная ошибка',
                        'error_info': str(e),
                    },
                    status=response_status,
                )
        finally:
            request_end_time = time.time()
            log_info((
                f'Request from [{request_user_ip}{(f" user_id:{request_user_id}") if request_user_id else ""}]: '
                f'{request_method} {request_path} - '
                f'STATUS {response_status} - {request_end_time - request_start_time:.6f} seconds'
            ))

    return inner_function


def require_auth(function):
    @handle_request
    def inner_function(request, *args, **kwargs):
        auth_token = request.headers.get('Authorization', '')

        use_child_company_id = request.headers.get('UseChildCompanyId', '')

        auth_resp = verify_user_auth(auth_token)

        if user_id := auth_resp.get('user_id'):
            user_company_id = auth_resp['user_company_id']
            user_roles = auth_resp['user_roles']

            if use_child_company_id:
                use_child_company_id = int(use_child_company_id)
                check_have_access_to_company(user_company_id, use_child_company_id, user_roles)
                user_company_id = use_child_company_id

            return (
                function(
                    request,
                    user_id,
                    user_company_id,
                    user_roles,
                    *args,
                    **kwargs,
                ),
                user_id,
            )

        return auth_resp

    return inner_function


def require_role(required_roles: str | list[str]):
    if type(required_roles) == str:
        required_roles = [required_roles]

    def wrapper(function):
        @require_auth
        def inner_function(request, user_id, user_company_id, user_roles, *args, **kwargs):
            role_check_passed = check_admin(user_roles)
            for required_role in required_roles:
                role_check_passed = role_check_passed or check_role(user_roles, required_role)
            if not role_check_passed:
                log_error(
                    f'Forbidden role. User ID - {user_id}, User roles - {user_roles}, Required roles - {", ".join(required_roles)}'
                )
                raise ForbiddenException('Недостаточно привилегий')

            return function(request, user_id, user_company_id, user_roles, *args, **kwargs)

        return inner_function

    return wrapper


def check_remote_ip_allowed(function):
    @handle_request
    def inner_function(request, *args, **kwargs):
        client_ip = get_client_ip(request)

        if '*' not in env.DJANGO_ALLOWED_REMOTE_IPS:
            if client_ip not in env.DJANGO_ALLOWED_REMOTE_IPS:
                log_error(f'Forbidden request from {client_ip}')
                raise ForbiddenException('Access denied')

        return function(request, *args, **kwargs)

    return inner_function


require_DELETE = require_http_methods(['DELETE'])
require_PUT = require_http_methods(['PUT'])
require_PATCH = require_http_methods(['PATCH'])
