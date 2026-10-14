from django.contrib import admin

from is_kmp.models.it_project import ITProject


@admin.register(ITProject)
class ITProjectAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'description',
        'purpose',
        'initiator',
        'leader',
        'budget',
        'start_date',
        'end_date',
        'company',
    ]

    search_fields = [
        'id',
        'name',
        'description',
        'purpose',
        'initiator',
        'leader',
        'start_date',
        'end_date',
        'company',
    ]

    list_filter = [
        'initiator',
        'leader',
        'company',
    ]
