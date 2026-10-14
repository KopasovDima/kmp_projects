from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from kmp_auth.models.user_profile import UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **__):
    if created:
        user_profile = UserProfile()
        user_profile.user = instance
        user_profile.company_id = 0
        user_profile.post = '-'
        user_profile.password_change_required = True
        user_profile.save()