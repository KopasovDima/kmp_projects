import datetime
import json
import os

import pandas as pd

from config.base_dir import BASE_DIR
from utils.database import get_statistics_db_connection
from utils.external_services._1c import get_1c_data
from utils.logger import log

SCRIPT_NAME = '1C STATISTICS'


def main():
    log(f'{SCRIPT_NAME}: process started')

    os.makedirs(f'{BASE_DIR}/generated/1c/', exist_ok=True)

    connection = None
    cursor = None

    has_error = False

    try:
        connection = get_statistics_db_connection()
        cursor = connection.cursor()

        # cursor.execute('TRUNCATE TABLE kmp_statistics_department CASCADE;')

        cursor.execute('TRUNCATE TABLE kmp_statistics_statistics1c CASCADE;')
        cursor.execute('ALTER SEQUENCE kmp_statistics_statistics1c_id_seq RESTART WITH 1;')

        requests_types = [
            'КоличествоВходящихДокументов',
            'КоличествоИсходящихДокументов',
            'КоличествоВнутреннихДокументов',
            'КоличествоЗакупок',
            'КоличествоПодзадачПоДепартаментам',
            'КоличествоПодзадачПоИсполнителям',
        ]

        date_now = datetime.datetime.now()

        years = {
            2023: [12],
        }

        for year in range(2024, date_now.year + 1):
            years[year] = []
            for month in range(1, 13):
                if year == date_now.year and month > date_now.month:
                    break
                years[year].append(month)

        result_1c_data = pd.DataFrame({
            'year': [],
            'month': [],
            'parameter': [],
            'id': [],
            'name': [],
            'value': []
        })

        for request_type in requests_types:
            for year, months in years.items():
                for month in months:
                    start_date = f'01.{month}.{year}'

                    end_date_month = month + 1
                    end_date_year = year
                    if end_date_month == 13:
                        end_date_month = 1
                        end_date_year += 1
                    end_date = f'01.{end_date_month}.{end_date_year}'

                    payload = json.dumps({
                        'method': request_type,
                        'startdate': start_date,
                        'enddate': end_date,
                    })
                    response = get_1c_data(payload)
                    if response.status_code != 200:
                        log(f'{SCRIPT_NAME}: 1C request failed', True)
                        log(f'{SCRIPT_NAME}: STATUS CODE - {response.status_code}', True)
                        log(f'{SCRIPT_NAME}: REQUEST PAYLOAD - {payload}', True)
                        continue
                    response = response.json()

                    t = 'department'
                    if response:
                        if response[0].get('ФИО'):
                            t = 'user'

                    result_1c_data = pd.concat([
                        result_1c_data,
                        pd.DataFrame({
                            'year': int(year),
                            'month': int(month),
                            'parameter': request_type,
                            'id': [resp_value.get('УИД') for resp_value in response],
                            'name': [
                                resp_value.get('Подразделение') or resp_value.get('ФИО') for resp_value in response
                            ],
                            'value': [int(resp_value.get('Количество')) for resp_value in response],
                            'type': t,
                        })
                    ])

        departments = result_1c_data[result_1c_data['type'] == 'department'][['id', 'name']].drop_duplicates()
        departments.to_csv(f'{BASE_DIR}/generated/1c/1c_departments.csv', index=False)

        result_1c_data['year'] = result_1c_data['year'].astype(int)
        result_1c_data['month'] = result_1c_data['month'].astype(int)
        result_1c_data['value'] = result_1c_data['value'].astype(int)

        result_1c_data_departments = result_1c_data[result_1c_data['type'] == 'department']
        del result_1c_data_departments['name']
        del result_1c_data_departments['type']
        result_1c_data_departments.to_csv(f'{BASE_DIR}/generated/1c/1c_statistics_departments.csv', index=False)

        result_1c_data_users = result_1c_data[result_1c_data['type'] == 'user']
        del result_1c_data_users['id']
        del result_1c_data_users['type']
        result_1c_data_users.to_csv(f'{BASE_DIR}/generated/1c/1c_statistics_users.csv', index=False)

        log(f'{SCRIPT_NAME}: Collected {len(result_1c_data)} rows of data')

        # with open(f'{BASE_DIR}/generated/1c/1c_departments.csv', 'r', encoding='utf-8') as file:
        #     next(file)
        #     cursor.copy_expert(
        #         'COPY kmp_statistics_department (_1c_uuid, name) FROM STDIN WITH CSV',
        #         file
        #     )

        with open(f'{BASE_DIR}/generated/1c/1c_statistics_departments.csv', 'r', encoding='utf-8') as file:
            next(file)
            cursor.copy_expert(
                'COPY kmp_statistics_statistics1c (year, month, parameter, _1c_department_id, value ) FROM STDIN WITH CSV',
                file
            )

        with open(f'{BASE_DIR}/generated/1c/1c_statistics_users.csv', 'r', encoding='utf-8') as file:
            next(file)
            cursor.copy_expert(
                'COPY kmp_statistics_statistics1c (year, month, parameter, _1c_user, value ) FROM STDIN WITH CSV',
                file
            )
    except (Exception,) as e:
        has_error = True
        log(f'{SCRIPT_NAME}: Error in main function: ' + str(e), True)
    finally:
        if not has_error:
            connection.commit()
        if cursor:
            cursor.close()
        if connection:
            connection.close()
    log(f'{SCRIPT_NAME}: process finished{" with error" if has_error else ""}')


if __name__ == '__main__':
    main()
