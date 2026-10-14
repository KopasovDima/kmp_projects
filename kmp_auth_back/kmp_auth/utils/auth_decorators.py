from kmp_auth.exceptions.auth_exception import AuthException
from kmp_auth.utils.decorators import handle_request
from kmp_auth.utils.jwt_tokens import decode_token, validate_token
from kmp_auth.utils.token_types import ACCESS_TOKEN_TYPE


def require_auth(function):
    @handle_request
    def inner_function(request, *args, **kwargs):
        auth_token = request.headers.get('Authorization', '')

        if not auth_token or not auth_token.startswith('Bearer '):
            raise AuthException('Ожидается получение Bearer токена')

        auth_token = auth_token.split(' ')[1]

        token_payload = decode_token(auth_token, ACCESS_TOKEN_TYPE)

        user_id = token_payload.get('user_id', '')

        validate_token(auth_token, user_id)

        if not user_id:
            raise AuthException()

        return function(request, user_id, *args, **kwargs), user_id
    return inner_function
