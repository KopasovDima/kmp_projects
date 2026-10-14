from django.urls import path

from kmp_auth.api import auth, departments, users

urlpatterns = [
    path('login/', auth.login),
    path('login_2fa/', auth.login_2fa),
    path('refresh/', auth.refresh),
    path('logout/', auth.logout),
    path('info/', auth.get_user_info),
    path('check/', auth.check_auth),
    path('change_password/', auth.change_password_for_auth_user),
    path('attach_profile_photo/', auth.attach_profile_photo),

    path('request_password_reset/', auth.request_password_reset),
    path('reset_password/', auth.reset_password),

    path('users/', users.get_users),
    path('internal_user_profiles/', users.get_internal_user_profiles),
    path('departments/', departments.get_departments),

    # Дальше добавить

    # Заявка на регистрацию ??? - сомнительно, проще внести вручную
    # Выйти со всех устройств
    # История входа
]