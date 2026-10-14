# Бэкенд-сервис личного кабинета ИС КМП


## Технологии и фреймворки
* Python
* Django


## Для работы с проектом требуется установить
* Python (используемая версия - 3.11.2)


## Локальный запуск (первоначальная настройка)
1. Создание виртуального окружения `.venv`
   ```shell
   python -m venv .venv
   ```
2. Активация виртуального окружения
   * Для Windows
      ```shell
      .\.venv\Scripts\activate
      ```
   * Для Linux
      ```shell
      source .venv/bin/activate
      ```
3. Установка зависимостей
    ```shell
   pip install -r requirements.txt
    ```
4. Создать копию файла `.env.example` с переменными окружения - после нужно будет прописать правильные значения в `.env`
   ```shell
    cp -n .env.example .env
    ```
5. *Опционально* - при использовании `DJANGO_DEBUG=True` нужно дополнительно установить `django-debug-toolbar`
   ```shell
    pip install django-debug-toolbar
    ```
6. Установка особых зависимостей (через requirements.txt устанавливается неправильно)
   * Для Windows
      ```shell
        pip uninstall channels
        pip uninstall daphne
        pip install -U channels["daphne"]
      ```
   * Для Linux
      ```shell
        pip uninstall channels && pip uninstall daphne && pip install -U channels["daphne"]
      ```
7. Запуск
   ```shell
   python manage.py runserver
   ```

# Локальный запуск (когда уже всё настроено)
1. Активация виртуального окружения (если нет автоматической активации через PyCharm)
   * Для Windows
      ```shell
      .\.venv\Scripts\activate
      ```
   * Для Linux
      ```shell
      source .venv/bin/activate
      ```
2. Запуск
   ```shell
   python manage.py runserver
   ```


## Как залить обновление на DEV-сервер по SSH
1. Подключиться по ssh к серверу
   ```shell
   ssh is_kmp_server
   ```
2. Перейти в директорию проекта `is_kmp_back`
   ```shell
   cd /var/apps/is_kmp/is_kmp_back/
   ```
3. Подтянуть изменения через Git
   ```shell
   git pull origin master
   ```
   Или внести изменения напрямую на сервере <br><br>
4. Пересобрать докер-контейнер с проектом 
    ```shell
    ./rebuild_docker_without_db.sh
    ```

   #### *Или то же самое можно сделать одной командой с локального компьютера*
   ```shell
   ssh is_kmp_server "cd /var/apps/is_kmp/is_kmp_back && git pull origin master && ./rebuild_docker_without_db.sh"
   ```

## Как залить обновление на PROD-сервер через REDVIRT
1. Подключиться в браузере к DMZ-серверу через интерфейс RED-виртуализации
2. Перейти в директорию проекта `is_kmp_back`
   ```shell
   cd /var/apps/is_kmp/is_kmp_back/
   ```
3. Подтянуть изменения через Git
   ```shell
   git pull origin master
   ```
   Или внести изменения напрямую на сервере <br><br>
4. Пересобрать докер-контейнер с проектом 
    ```shell
    ./rebuild_docker.sh
    ```
