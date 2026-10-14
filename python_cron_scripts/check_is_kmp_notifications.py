from check_support_tasks_finished import format_date, format_time
from utils.database import execute_select_sql, execute_sql, get_is_kmp_db_connection, get_kmp_auth_db_connection

from utils.external_services.notifications import send_email_event_reminder
from utils.logger import log

SCRIPT_NAME = 'CHECK IS_KMP NOTIFICATIONS'


def main():
    has_error = False
    log(f'{SCRIPT_NAME}: process started')

    is_kmp_connection = None
    kmp_auth_connection = None

    try:
        is_kmp_connection = get_is_kmp_db_connection()
        kmp_auth_connection = get_kmp_auth_db_connection()

        limit = 10

        while True:
            notifications_to_send = execute_select_sql(
                is_kmp_connection,
                'select epn.id as id, e.id as event_id, epn.date as notification_date, ep.user_id as user_id, e.name as event_name, '
                'e.description as event_description, e.start_date as event_start_date, e.link as event_link '
                'from public.is_kmp_eventparticipantnotification epn '
                'join public.is_kmp_eventparticipant ep on ep.id = epn.event_participant_id '
                'join public.is_kmp_event e on e.id = ep.event_id '
                f'where completed = false and date < now() '
                f'limit {limit} '
                f'offset 0'
            )

            if not notifications_to_send:
                break

            for notification in notifications_to_send:
                try:
                    log(f'{SCRIPT_NAME}: Sending email to user (id - {notification["user_id"]}) about event (id - {notification["event_id"]})')

                    users = execute_select_sql(
                        kmp_auth_connection,
                        'select first_name, last_name, email '
                        'from public.auth_user '
                        f'where id = {notification["user_id"]}'
                    )

                    if not users:
                        log(f'{SCRIPT_NAME}: User not found - id {notification["user_id"]}', True)

                        continue

                    user = users[0]

                    execute_sql(
                        is_kmp_connection,
                        'update public.is_kmp_eventparticipantnotification '
                        f'set completed=true '
                        f'where id={notification["id"]}',
                        True,
                    )

                    send_email_event_reminder(
                        email=user['email'],
                        subject='Напоминание о мероприятии',
                        params={
                            'user_name': f'{user["first_name"]} {user["last_name"]}',
                            'event_name': notification['event_name'],
                            'event_description': notification['event_description'],
                            'start_date_string': format_date(notification['event_start_date']),
                            'start_time_string': format_time(notification['event_start_date']),
                            'link': notification['event_link'],
                        }
                    )
                except (Exception,) as e:
                    log(f'{SCRIPT_NAME}: Error with notification ({notification["id"]}): {e}', True)

    except (Exception,) as e:
        has_error = True
        log(f'{SCRIPT_NAME}: Error in main function: ' + str(e), True)
    finally:
        if is_kmp_connection:
            is_kmp_connection.close()
        if kmp_auth_connection:
            kmp_auth_connection.close()
    log(f'{SCRIPT_NAME}: process finished{" with error" if has_error else ""}')


if __name__ == '__main__':
    main()
