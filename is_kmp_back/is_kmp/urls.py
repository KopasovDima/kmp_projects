from django.urls import path

from is_kmp.api.budgets import budgets, items
from is_kmp.api.business_functions import business_functions
from is_kmp.api.chats import chats
from is_kmp.api.companies import companies
from is_kmp.api.events import event_participants, event_participant_notifications, events
from is_kmp.api.it_projects import it_projects
from is_kmp.api.notifications_settings import notifications_settings
from is_kmp.api.offers import offers
from is_kmp.api.orders import orders
from is_kmp.api.purchases import purchases
from is_kmp.api.software import company_software, implementation_statuses, software, software_classes, \
    software_tags, software_versions

urlpatterns = [
    # Budgets
    path('budgets/<int:budget_report_id>/remove/', budgets.remove_budget_report_item),
    path('budgets/save/', budgets.save_budget),
    path('budgets/', budgets.get_budgets),

    path('budget_items/<str:budget_item_name>/budgets/', items.get_budget_item_overall_budgets),
    path('budget_items/create/', items.create_budget_item),
    path('budget_items/', items.get_budget_items),

    path('companies/available/', companies.get_available_companies),
    path('companies/', companies.get_companies),

    # Company Software
    path('software/company/<int:company_software_id>/update/', company_software.update_company_software),
    path('software/company/<int:company_software_id>/delete/', company_software.delete_company_software),
    path('software/company/by_classes/', company_software.get_company_software_by_classes),
    path('software/company/add_software/', company_software.add_company_software),
    path('software/company/', company_software.get_company_software),

    # Software Classes and Tags
    path('software/classes/', software_classes.get_classes),
    path('software/tags/', software_tags.get_tags),

    # Software Versions
    path('software/<int:software_id>/versions/add/', software_versions.add_software_version),
    path('software/<int:software_id>/versions/', software_versions.get_software_versions),

    # Software
    path('software/<int:software_id>/update/', software.update_software),
    path('software/create/', software.create_software),
    path('software/', software.get_software),

    # Implementation statuses
    path('implementation_statuses/', implementation_statuses.get_implementation_statuses),

    # Events
    path('events/<int:event_id>/update/', events.update_event),
    path('events/<int:event_id>/delete/', events.delete_event),
    path('events/count/', events.get_events_count),
    path('events/create/', events.create_event),
    path('events/', events.get_events_on_date),

    # Event participants
    path('event_participants/<int:participant_id>/delete/', event_participants.delete_participant),
    path('event_participants/add/', event_participants.add_participant),
    path('event_participants/user_profiles/', event_participants.get_user_profiles),
    path('event_participants/', event_participants.get_participants),

    # Event participant notifications
    path(
        'event_participant_notifications/<int:event_participant_notification_id>/delete/',
        event_participant_notifications.delete_event_participant_notification,
    ),
    path(
        'event_participant_notifications/intervals/',
        event_participant_notifications.get_possible_notification_intervals,
    ),
    path(
        'event_participant_notifications/notify_all_now/',
        event_participant_notifications.notify_all_participants_now,
    ),
    path('event_participant_notifications/add/', event_participant_notifications.add_event_participant_notification),
    path('event_participant_notifications/', event_participant_notifications.get_event_participant_notifications),

    # IT Projects
    path('it_projects/<int:it_project_id>/delete/', it_projects.delete_it_project),
    path('it_projects/<int:it_project_id>/update/', it_projects.update_it_project),
    path('it_projects/create/', it_projects.create_it_project),
    path('it_projects/', it_projects.get_it_projects),

    # Chats
    path('chats/<int:chat_id>/participants/<int:removing_user_id>/remove/', chats.remove_participant_from_group_chat),
    path('chats/<int:chat_id>/messages/<int:message_id>/read/', chats.read_chat_message),
    path('chats/<int:chat_id>/participants/', chats.get_group_chat_participants),
    path('chats/<int:chat_id>/add_participants/', chats.add_participants_to_group_chat),
    path('chats/<int:chat_id>/update/', chats.update_group_chat),
    path('chats/<int:chat_id>/delete/', chats.delete_group_chat),
    path('chats/<int:chat_id>/write_message/', chats.write_message_to_chat),
    path('chats/<int:chat_id>/messages/', chats.get_chat_messages),
    path('chats/personal_chat/<int:contact_user_id>/', chats.find_personal_chat_with_user),
    path('chats/create_group/', chats.create_group_chat),
    path('chats/create_personal/', chats.create_personal_chat),
    path('chats/unread_messages_count/', chats.get_unread_messages_count),
    path('chats/unread_chats/', chats.get_user_unread_chats),
    path('chats/', chats.get_chats),

    # Notifications settings
    path(
        'settings/notifications/<int:notifications_setting_id>/set_new_value/',
        notifications_settings.set_notifications_user_settings_new_value,
    ),
    path(
        'settings/notifications/<int:notifications_setting_id>/check_enabled/',
        notifications_settings.check_notifications_setting_enabled,
    ),
    path('settings/notifications/', notifications_settings.get_notifications_settings),

    # Offers
    path('offers/<int:offer_id>/comments/<int:comment_id>/read/', offers.read_offer_comment),
    path('offers/<int:offer_id>/comments/', offers.get_offer_comments),
    path('offers/<int:offer_id>/write_comment/', offers.write_comment_to_offer),
    path('offers/<int:offer_id>/delete/', offers.delete_offer),
    path('offers/<int:offer_id>/update/', offers.update_offer),
    path('offers/<int:offer_id>/remove_attachments/', offers.remove_attachments),
    path('offers/<int:offer_id>/add_attachments/', offers.add_attachments),
    path('offers/<int:offer_id>/attachments/', offers.get_attachments),
    path('offers/unread_comments_count/', offers.get_unread_comments_count),
    path('offers/create/', offers.create_offer),
    path('offers/', offers.get_offers),

    # Orders
    path('orders/<int:order_id>/delete/', orders.delete_order),
    path('orders/<int:order_id>/update/', orders.update_order),
    path('orders/<int:order_id>/remove_attachments/', orders.remove_attachments),
    path('orders/<int:order_id>/add_attachments/', orders.add_attachments),
    path('orders/<int:order_id>/attachments/', orders.get_attachments),
    path('orders/create/', orders.create_order),
    path('orders/', orders.get_orders),

    # BuyingPlan
    path('purchases/<int:purchase_id>/delete/', purchases.delete_purchase),
    path('purchases/<int:purchase_id>/update/', purchases.update_purchase),
    path('purchases/create/', purchases.create_purchase),
    path('purchases/types/', purchases.get_purchase_types),
    path('purchases/years/', purchases.get_purchases_possible_years),
    path('purchases/', purchases.get_purchases),

    # BusinessFunctions
    path(
        'business_function_by_company/<int:business_function_by_company_id>/update/',
        business_functions.update_business_function_by_company,
    ),
    path(
        'business_function_by_company/<int:business_function_by_company_id>/reset/',
        business_functions.reset_company_business_function,
    ),
    path(
        'business_functions/<int:business_function_id>/attach_company_software/<int:company_software_id>/',
        business_functions.attach_company_software_to_business_function,
    ),
    path(
        'business_functions/<int:business_function_id>/attach_new_company_software/<int:software_id>/',
        business_functions.attach_new_company_software_to_business_function,
    ),
    path(
        'business_functions/<int:business_function_id>/detach_company_software/<int:company_software_id>/',
        business_functions.detach_company_software_from_business_function,
    ),
    path(
        'business_functions/<int:business_function_id>/details/',
        business_functions.get_business_function_by_company_details,
    ),
    path('business_functions/download_full_report/', business_functions.download_full_report),
    path('business_functions/download_report/', business_functions.download_report),
    path('business_functions/<int:business_function_id>/delete/', business_functions.delete_business_function),
    path('business_functions/<int:business_function_id>/update/', business_functions.update_business_function),
    path(
        'business_functions/<int:business_function_id>/update_examples/',
         business_functions.update_business_function_examples,
    ),
    path('business_functions/<int:business_function_id>/change_order/', business_functions.change_business_function_order),
    path('business_functions/create/', business_functions.add_business_function),
    path('business_functions/', business_functions.get_business_functions),
]
