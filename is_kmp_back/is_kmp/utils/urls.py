from config.env import env


def get_file_server_url(request, file_url):
    file_server_url = request.build_absolute_uri(file_url)

    if env.DJANGO_HTTPS_ENABLED:
        file_server_url = file_server_url.replace('http', 'https')

    return file_server_url
