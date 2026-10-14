# Набор скриптов для периодического запуска через CRON на сервере
## Скрипты

***KMP_STATISTICS***
* [collect_1c_statistics.py](collect_1c_statistics.py) - Сбор статистики из API 1С
* [collect_call_statistics.py](collect_call_statistics.py) - Сбор статистики по звонкам из загруженных в [source_csv/calls](source_csv/calls) CSV файлов
  * по-умолчанию удаляются все старые данные и заменяются новыми
  * для замены данных за определённый период (месяц + год) используются параметры `--year=YYYY --month=MM`
    * пример: `python ./collect_call_statistics.py --year=2025 --month=04`
  * для проверки изменились ли файлы с данными используется параметр `--check_files_hash=1`
    * пример: `python ./collect_call_statistics.py --check_files_hash=1`
* [collect_redmine_statistics.py](collect_redmine_statistics.py) - Сбор статистики из API Redmine

***IS_KMP***
* [check_is_kmp_notifications.py](check_is_kmp_notifications.py) - Рассылка уведомлений о предстоящих мероприятиях
* [check_is_kmp_unread_chats.py](check_is_kmp_unread_chats.py) - Рассылка уведомлений о непрочитанных сообщениях в чатах

## Технологии и фреймворки
* Python

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
   ```shell
    cp -n .env.example .env
    ``` 
5. Запуск нужного скрипта
    ```shell
   python check_tasks_finished.py
   ```

## Как залить обновление на сервер
1. На сервере уже всё настроено, поэтому нужно только обновить файлы - предпочтительный способ через git
   <br>
   Путь к проекту `/var/apps/python_cron_scripts`
2. При необходимости нужно добавить запуск скрипта в CRON (если этот скрипт не был использован до этого)
   <br>
   Сейчас все скрипты настроены от пользователя `kopasov`
   ```shell
   sudo crontab -e -u [указать_имя_пользователя]
   ```
