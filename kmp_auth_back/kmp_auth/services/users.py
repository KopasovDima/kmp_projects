from kmp_auth.models.user_profile import UserProfile


def get_user_profile_by_user_id(user_id: int) -> UserProfile | None:
    return UserProfile.objects.filter(user__id=user_id).first()
