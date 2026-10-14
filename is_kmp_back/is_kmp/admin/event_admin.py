from django.contrib import admin

from is_kmp.models.event import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'description',
        'start_date',
        'end_date',
        'link',
        'color',
        'author_id',
    ]

    search_fields = [
        'id',
        'name',
        'description',
        'link',
    ]
