import httpx
import requests

from config.env import env
from utils.logger import log

def get_redmine_issues(created_on_filter: str, limit: int, offset: int):
    created_on_filter = created_on_filter.replace('>', '%3E').replace('<', '%3C').replace('=', '%3D')
    url = f'{env.REDMINE_SERVICE_URL}/issues.json?status_id=*&created_on={created_on_filter}&limit={limit}&offset={offset}&sort=created_on:asc'

    headers = {
      'X-Redmine-API-Key': env.REDMINE_API_KEY,
    }

    response = requests.request('GET', url, headers=headers)

    return response
