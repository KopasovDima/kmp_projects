import datetime
import os

import pandas as pd

from config.base_dir import BASE_DIR
from utils.database import get_statistics_db_connection
from utils.logger import log
from utils.external_services.redmine import get_redmine_issues

SCRIPT_NAME = 'REDMINE STATISTICS'
LIMIT = 50


def month_to_correct_string(month: int):
    if month < 10:
        return f'0{month}'
    return month


def main():
    log(f'{SCRIPT_NAME}: process started')

    os.makedirs(f'{BASE_DIR}/generated/redmine/', exist_ok=True)

    connection = None
    cursor = None

    has_error = False

    try:
        connection = get_statistics_db_connection()
        cursor = connection.cursor()

        cursor.execute('TRUNCATE TABLE kmp_statistics_redminestatistics CASCADE;')

        date_now = datetime.datetime.now()

        years = {}

        for year in range(2020, date_now.year + 1):
            years[year] = []
            for month in range(1, 13):
                if year == date_now.year and month > date_now.month:
                    break
                years[year].append(month)

        result_data = pd.DataFrame({
            'year': [],
            'month': [],
            'issue_id': [],
            'project_id': [],
            'project_name': [],
            'status_id': [],
            'status_name': [],
            'priority_id': [],
            'priority_name': [],
            'subject': [],
            'description': [],
            'start_date': [],
            'due_date': [],
            'created_on': [],
            'updated_on': [],
            'assigned_to_id': [],
            'assigned_to_name': [],
            'author_id': [],
            'author_name': [],
        })

        for year, months in years.items():
            for month in months:
                offset = 0

                start_date = f'{year}-{month_to_correct_string(month)}-01'

                end_date_month = month + 1
                end_date_year = year
                if end_date_month == 13:
                    end_date_month = 1
                    end_date_year += 1
                end_date = f'{end_date_year}-{month_to_correct_string(end_date_month)}-01'

                created_on_filter = f'><{start_date}|{end_date}'

                while True:
                    response = get_redmine_issues(created_on_filter, LIMIT, offset)

                    if response.status_code != 200:
                        print('REPSONSE STATUS', response.status_code)
                        print('REQUEST PARAMS', created_on_filter, LIMIT, offset)
                        break
                    response = response.json()

                    issues = response.get('issues', [])

                    if len(issues) == 0:
                        break

                    result_data = pd.concat([
                        result_data,
                        pd.DataFrame({
                            'year': int(year),
                            'month': int(month),
                            'issue_id': [issue.get('id') for issue in issues],
                            'project_id': [issue.get('project', {}).get('id') for issue in issues],
                            'project_name': [issue.get('project', {}).get('name') for issue in issues],
                            'status_id': [issue.get('status', {}).get('id') for issue in issues],
                            'status_name': [issue.get('status', {}).get('name') for issue in issues],
                            'priority_id': [issue.get('priority', {}).get('id') for issue in issues],
                            'priority_name': [issue.get('priority', {}).get('name') for issue in issues],
                            'subject': [issue.get('subject') for issue in issues],
                            'description': [issue.get('description') for issue in issues],
                            'start_date': [issue.get('start_date') for issue in issues],
                            'due_date': [issue.get('due_date') for issue in issues],
                            'created_on': [issue.get('created_on') for issue in issues],
                            'updated_on': [issue.get('updated_on') for issue in issues],
                            'assigned_to_id': [issue.get('assigned_to', {}).get('id') for issue in issues],
                            'assigned_to_name': [issue.get('assigned_to', {}).get('name') for issue in issues],
                            'author_id': [issue.get('author', {}).get('id') for issue in issues],
                            'author_name': [issue.get('author', {}).get('name') for issue in issues],
                        })
                    ])

                    offset += LIMIT

        result_data['year'] = result_data['year'].astype('Int64')
        result_data['month'] = result_data['month'].astype('Int64')
        result_data['issue_id'] = result_data['issue_id'].astype('Int64')
        result_data['project_id'] = result_data['project_id'].astype('Int64')
        result_data['status_id'] = result_data['status_id'].astype('Int64')
        result_data['priority_id'] = result_data['priority_id'].astype('Int64')
        result_data['assigned_to_id'] = result_data['assigned_to_id'].astype('Int64')
        result_data['author_id'] = result_data['author_id'].astype('Int64')

        # Некоторые задачи учитываются сразу за два месяца, поэтому их нужно убирать
        result_data = (
            result_data
            .sort_values(['year', 'month'], ascending=False)
            .drop_duplicates(result_data.columns[2:])
        )

        result_data.to_csv(f'{BASE_DIR}/generated/redmine/redmine_statistics.csv', index=False)

        log(f'{SCRIPT_NAME}: Collected {len(result_data)} redmine issues')

        with open(f'{BASE_DIR}/generated/redmine/redmine_statistics.csv', 'r', encoding='utf-8') as file:
            next(file)
            cursor.copy_expert(
                '''COPY kmp_statistics_redminestatistics (
                year, month, issue_id, project_id, project_name, status_id, status_name, priority_id, priority_name, subject, 
                description, start_date, due_date, created_on, updated_on, assigned_to_id, assigned_to_name, author_id, author_name
                ) FROM STDIN WITH CSV
                ''',
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
