from django.apps import AppConfig


class KmpAuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'kmp_auth'

    def ready(self):
        import kmp_auth.signals.user_profile # noqa