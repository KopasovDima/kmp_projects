FROM python:3.11

WORKDIR /opt/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update

COPY requirements.txt requirements.txt

RUN pip install --upgrade pip --no-cache-dir && pip install -r requirements.txt --no-cache-dir

RUN pip install gunicorn

COPY . .

RUN mkdir /opt/app/static/ -p
RUN mkdir /opt/app/logs/ -p

ENTRYPOINT ["sh", "entrypoint.sh"]
