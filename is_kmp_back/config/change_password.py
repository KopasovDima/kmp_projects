from django.views.decorators.http import require_POST

from django.contrib.auth import get_user_model

from is_kmp.utils.decorators import handle_request, check_remote_ip_allowed
from is_kmp.utils.request_params import get_request_value_str


@require_POST
@check_remote_ip_allowed
def change_admin_user_password(request):
    email = get_request_value_str(request.POST, 'email', True)
    password = get_request_value_str(request.POST, 'password', True)

    user_model = get_user_model()

    if not user_model.objects.filter(username=email).exists():
        user_model.objects.create_superuser(email, email, password)
    else:
        user = user_model.objects.get(username=email)
        user.set_password(password)
        user.save()

    return 'OK'
