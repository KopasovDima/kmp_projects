import datetime
import json
import os
import sys

import pandas as pd

from config.base_dir import BASE_DIR
from utils.database import get_statistics_db_connection
from utils.external_services.auth import get_users
from utils.files import get_files, get_file_hash_md5
from utils.logger import log, log_error

SCRIPT_NAME = 'CALL STATISTICS'

USERS_START_WORKING_DATES = {
    '5002': datetime.datetime(2025, 4, 1),
    '5005': datetime.datetime(2025, 4, 1),
    '5042': datetime.datetime(2025, 4, 6),
    '5044': datetime.datetime(2025, 5, 26),
    '5015': datetime.datetime(2025, 8, 1),
}

PROCESSED_CALL_STATISTICS_FILES_JSON = 'processed_call_statistics_files.json'

CALL_STATISTICS_FILES_DIR = 'source_csv/calls'

GENERATED_CALL_STATISTICS_FILES_DIR = 'generated/calls'


def prepare_statistics(file_name):
    log(f'{SCRIPT_NAME}: Processing file {file_name}')

    users = pd.DataFrame(get_users())

    # Исключаем сотрудника с номером '-'
    users = users[users['number'] != '-']

    real_users_phone_numbers = users.number.to_list()

    init_call_stats = pd.read_csv(
        f'{BASE_DIR}/{CALL_STATISTICS_FILES_DIR}/{file_name}',
        names=['origin', 'destination', 'call_date', '?1', 'duration', 'answered', '?2', 'call_type'],
        header=None,
    )

    del init_call_stats['?1']
    del init_call_stats['?2']
    init_call_stats['answered'] = init_call_stats['answered'] == 'ANSWERED'
    init_call_stats[['origin_name', 'origin_number']] = init_call_stats['origin'].str.extract(
        r'(?:([^<]+)\s*)?<([^>]+)>'
    )

    call_stats = init_call_stats[
        (init_call_stats['origin_number'].isin(real_users_phone_numbers)) |
        (init_call_stats['destination'].isin(real_users_phone_numbers))
        ]

    # В логе найдено два звонка продолжительностью более 2_900_000 секунд (несколько суток) - скорее всего это какая-то ошибка
    call_stats = call_stats[call_stats['duration'] < 2_900_000]

    # В логе есть записи
    #     с продолжительностью больше 0, но почему-то помеченые как Неотвеченные
    #     с продолжительностью равной 0, но почему-то помеченые как Отвеченные
    call_stats['answered'] = call_stats['duration'] > 0

    internal_incoming_calls = call_stats[(
            (call_stats['call_type'] == 'internal') &
            (call_stats['destination'].isin(real_users_phone_numbers))
    )]
    internal_outgoing_calls = call_stats[(
            (call_stats['call_type'] == 'internal') &
            (call_stats['origin_number'].isin(real_users_phone_numbers))
    )]
    external_incoming_calls = call_stats[(
            (call_stats['call_type'] == 'incoming') &
            (call_stats['destination'].isin(real_users_phone_numbers))
    )]
    external_outgoing_calls = call_stats[(
            (call_stats['call_type'] == 'outgoing') &
            (call_stats['origin_number'].isin(real_users_phone_numbers))
    )]

    internal_incoming_calls = pd.DataFrame({
        'phone_number': internal_incoming_calls['destination'],
        'contacting_number': internal_incoming_calls['origin_number'],
        'call_date': internal_incoming_calls['call_date'],
        'duration': internal_incoming_calls['duration'],
        'answered': internal_incoming_calls['answered'],
        'call_type': 'internal_incoming',
    })

    internal_outgoing_calls = pd.DataFrame({
        'phone_number': internal_outgoing_calls['origin_number'],
        'contacting_number': internal_outgoing_calls['destination'],
        'call_date': internal_outgoing_calls['call_date'],
        'duration': internal_outgoing_calls['duration'],
        'answered': internal_outgoing_calls['answered'],
        'call_type': 'internal_outgoing',
    })

    external_incoming_calls = pd.DataFrame({
        'phone_number': external_incoming_calls['destination'],
        'contacting_number': external_incoming_calls['origin_number'],
        'call_date': external_incoming_calls['call_date'],
        'duration': external_incoming_calls['duration'],
        'answered': external_incoming_calls['answered'],
        'call_type': 'external_incoming',
    })

    external_outgoing_calls = pd.DataFrame({
        'phone_number': external_outgoing_calls['origin_number'],
        'contacting_number': external_outgoing_calls['destination'],
        'call_date': external_outgoing_calls['call_date'],
        'duration': external_outgoing_calls['duration'],
        'answered': external_outgoing_calls['answered'],
        'call_type': 'external_outgoing',
    })

    prepared_call_stats = pd.concat([
        internal_incoming_calls,
        internal_outgoing_calls,
        external_incoming_calls,
        external_outgoing_calls,
    ])

    prepared_call_stats['call_date'] = pd.to_datetime(prepared_call_stats['call_date'])

    for phone_number, start_working_date in USERS_START_WORKING_DATES.items():
        user_calls = prepared_call_stats[prepared_call_stats['phone_number'] == phone_number]

        user_calls = user_calls[user_calls['call_date'] > start_working_date]
        prepared_call_stats = prepared_call_stats[prepared_call_stats['phone_number'] != phone_number]

        prepared_call_stats = pd.concat([prepared_call_stats, user_calls])

    prepared_call_stats.to_csv(f'{BASE_DIR}/{GENERATED_CALL_STATISTICS_FILES_DIR}/prepared_{file_name}', index=False)

    log(f'{SCRIPT_NAME}: Prepared {len(prepared_call_stats)} rows')


def get_unprocessed_files_by_hash():
    try:
        with open(BASE_DIR / PROCESSED_CALL_STATISTICS_FILES_JSON, 'r', encoding='utf-8') as file:
            processed_files_info = json.load(file)

        files_for_processing = []

        for file_name in get_files(BASE_DIR / CALL_STATISTICS_FILES_DIR, 'csv'):
            if file_name not in processed_files_info:
                files_for_processing.append(file_name)
                continue

            prev_file_hash = processed_files_info.get(file_name)
            file_hash = get_file_hash_md5(BASE_DIR / CALL_STATISTICS_FILES_DIR / file_name)

            if prev_file_hash != file_hash:
                files_for_processing.append(file_name)

        return files_for_processing
    except (Exception,) as e:
        log_error(f'{SCRIPT_NAME}: unable to get unprocessed files: {e}')

    return []


def confirm_file_processed(file_name):
    try:
        with open(BASE_DIR / PROCESSED_CALL_STATISTICS_FILES_JSON, 'r', encoding='utf-8') as file:
            processed_files_info = json.load(file)

        file_hash = get_file_hash_md5(BASE_DIR / CALL_STATISTICS_FILES_DIR / file_name)

        processed_files_info[file_name] = file_hash

        with open(BASE_DIR / PROCESSED_CALL_STATISTICS_FILES_JSON, 'w', encoding='utf-8') as file:
            json.dump(processed_files_info, file, indent=4)
    except (Exception,) as e:
        log_error(f'{SCRIPT_NAME}: unable to confirm processed file ({file_name}): {e}')


def main():
    params = {}
    for arg in sys.argv[1:]:
        if arg.startswith('--'):
            key, value = arg[2:].split('=', 1)
            params[key] = value

    log(f'{SCRIPT_NAME}: process started')

    os.makedirs(f'{BASE_DIR}/{GENERATED_CALL_STATISTICS_FILES_DIR}/', exist_ok=True)

    connection = None
    cursor = None

    has_error = False

    processed_files = []

    try:
        connection = get_statistics_db_connection()
        cursor = connection.cursor()

        parse_year = params.get('year')

        parse_month = params.get('month')

        check_files_hash = not not params.get('check_files_hash')

        if (not parse_year or not parse_month) and not check_files_hash:
            cursor.execute('TRUNCATE TABLE kmp_statistics_callstatistics;')
            cursor.execute('ALTER SEQUENCE kmp_statistics_callstatistics_id_seq RESTART WITH 1;')

        if check_files_hash:
            calls_csv_files = get_unprocessed_files_by_hash()
        else:
            calls_csv_files = get_files(f'{BASE_DIR}/{CALL_STATISTICS_FILES_DIR}', 'csv')

        for file_name in calls_csv_files:
            if parse_year and parse_month:
                if f'{parse_year}_{parse_month}' not in file_name:
                    continue

                cursor.execute(
                    f'DELETE FROM kmp_statistics_callstatistics WHERE '
                    f'TO_CHAR(call_date, \'YYYY-MM\') = \'{parse_year}-{parse_month}\';'
                )
            elif check_files_hash:
                cursor.execute(
                    f'DELETE FROM kmp_statistics_callstatistics WHERE '
                    f'TO_CHAR(call_date, \'YYYY-MM\') = \'{file_name[-11:-4].replace("_", "-")}\';'
                )

            prepare_statistics(file_name)

            with open(f'{BASE_DIR}/{GENERATED_CALL_STATISTICS_FILES_DIR}/prepared_{file_name}', 'r') as file:
                next(file)
                cursor.copy_expert(
                    sql=(
                        'COPY kmp_statistics_callstatistics '
                        '(user_id, contacting_number, call_date, duration, answered, call_type) '
                        'FROM STDIN WITH CSV'
                    ),
                    file=file,
                )

            processed_files.append(file_name)

    except (Exception,) as e:
        has_error = True
        log(f'{SCRIPT_NAME}: Error in main function: ' + str(e), True)
    finally:
        if not has_error:
            for file_name in processed_files:
                confirm_file_processed(file_name)

            connection.commit()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

    log(f'{SCRIPT_NAME}: process finished{" with error" if has_error else ""}')


if __name__ == '__main__':
    main()
