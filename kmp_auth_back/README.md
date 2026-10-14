# Бэкенд-сервис единого сервиса авторизации


## Технологии и фреймворки
* Python
* Django


## Для работы с проектом требуется установить
* Python (используемая версия - 3.11.2)


## Как запустить локально
1. Создание виртуального окружения `.venv`
    ```shell
   python -m venv .venv
    ```
2. Активация виртуального окружения
   <br>
   * Для Windows
      ```shell
      .\.venv\Scripts\activate
      ```
   * Для Linux
      ```shell
      source .venv/bin/activate
      ```
3. Установка библиотек
    ```shell
   pip install -r requirements.txt
    ```
4. Создать копию файла `.env.example` с переменными окружения - после нужно будет прописать правильные значения в `.env`
   <br>
   **Если файл уже есть, то он будет перезаписан!**
   ```shell
    cp .env.example .env
    ```
5. Локальный запуск
    ```shell
    python ./manage.py runserver
   ```


## Как залить обновление на сервер
1. Перейти в директорию проекта `django_backend`
   ```shell
   cd /var/kmp_auth/kmp_auth_back/
   ```
2. Подтянуть изенения через Git
   ```shell
   git pull origin master
   ```
   
   Или внести изменения напрямую на сервере


3. Пересобрать докер-контейнер с проектом 
    ```shell
    ./rebuild_docker.sh
    ```
