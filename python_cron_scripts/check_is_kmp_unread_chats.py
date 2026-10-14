from utils.external_services.auth import get_internal_users
from utils.external_services.is_kmp import check_unread_chats_notification_enabled, get_unread_chats
from utils.external_services.notifications import send_unread_chats_reminder
from utils.logger import log

SCRIPT_NAME = 'CHECK IS_KMP UNREAD CHATS'


def main():
    has_error = False
    log(f'{SCRIPT_NAME}: process started')
    try:
        users = get_internal_users()

        for user in users:
            user = user.get('user', {})

            user_id = user.get('id')
            if not user_id:
                log(f'{SCRIPT_NAME}: empty user id - {user}', True)
                continue

            notification_enabled = check_unread_chats_notification_enabled(user_id)

            if not notification_enabled:
                continue

            unread_chats = get_unread_chats(user_id)

            if not unread_chats:
                continue

            send_unread_chats_reminder(
                email=user.get('email'),
                subject='Напоминание о непрочитанных сообщениях',
                params={
                    'unread_chats': unread_chats,
                }
            )

            log(f'{SCRIPT_NAME}: user ({user.get("email")}) notified about {len(unread_chats)} chats')

    except (Exception,) as e:
        has_error = True
        log(f'{SCRIPT_NAME}: Error in main function: ' + str(e), True)
    log(f'{SCRIPT_NAME}: process finished{" with error" if has_error else ""}')


if __name__ == '__main__':
    main()
