from django import forms
from django.contrib import admin

from kmp_auth.models.role import Role
from kmp_auth.models.user_profile import UserProfile
from kmp_auth.utils.related_apis.is_kmp import get_companies


class RolesInline(admin.TabularInline):
    model = UserProfile.roles.through
    verbose_name = 'Роль пользователя'
    verbose_name_plural = 'Роли пользователя'
    can_delete = True


class UserProfileAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        choices = [('', '---')]
        try:
            companies = get_companies()

            choices += [(company['id'], company['short_name']) for company in companies['companies']]
        except (Exception,):
            pass

        self.fields['company_id'] = forms.ChoiceField(
            choices=choices,
            required=True,
            label='Компания',
        )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    form = UserProfileAdminForm

    exclude = [
        'roles',
    ]
    inlines = [
        RolesInline,
    ]

    list_display = [
        '__str__',
    ]

    list_filter = [
        'company_id',
        'post',
        'password_change_required',
    ]

    search_fields = [
        'company_id',
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
    ]


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = [
        'identifier',
        'name',
    ]

    list_editable = [
        'name',
    ]

    search_fields = [
        'identifier',
        'name',
    ]
