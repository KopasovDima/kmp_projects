from django.contrib import admin

from is_kmp.models.business_function_history import BusinessFunctionHistory


@admin.register(BusinessFunctionHistory)
class BusinessFunctionHistoryAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    list_display = [
        'business_function_id',
        'action_type',
        'changed_by_user',
        'changes',
        'added',
    ]

    list_filter = [
        'action_type',
        'changed_by_user',
    ]

    search_fields = [
        'business_function_id',
        'changes',
    ]
