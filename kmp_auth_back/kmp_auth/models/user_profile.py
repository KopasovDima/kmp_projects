import uuid

from django.contrib.auth.models import User
from django.db import models

from kmp_auth.models.role import Role
from kmp_auth.utils.related_apis.is_kmp import get_companies


def user_photo_path(instance, filename):
    if '.' in filename:
        filename = filename.split('.')[-1]

    return f'user_photos/{instance.pk}/{uuid.uuid4()}.{filename}'


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='Пользователь')

    company_id = models.IntegerField(verbose_name='ID Компании (IS_KMP)')

    post = models.CharField(verbose_name='Должность')

    roles = models.ManyToManyField(Role, verbose_name='Роли пользователя')

    password_change_required = models.BooleanField(default=True, verbose_name='Требуется смена пароля')

    photo = models.ImageField(upload_to=user_photo_path, blank=True, null=True)

    def __str__(self):
        try:
            if self.company_id:
                company_name = get_companies(self.company_id).get('companies', [{}])[0].get('short_name', '')
                if company_name:
                    company_name = f' ({company_name})'
            else:
                company_name = ' (---)'
        finally:
            pass

        return (
            f'Профиль пользователя {self.user.username if self.user else "???"} {self.post}{company_name}'
        )

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'
        ordering = ['id']
