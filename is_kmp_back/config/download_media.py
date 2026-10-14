import os
import urllib

from django.http import FileResponse

from config.base_dir import BASE_DIR
from is_kmp.utils.request_params import get_request_value_str


def download_media(request, file_path):
    filename = get_request_value_str(request.GET, 'original_name') or os.path.basename(file_path)

    full_path = os.path.join(BASE_DIR, file_path)

    response = FileResponse(open(full_path, 'rb'))

    if urllib.parse.quote(filename) != filename:
        response['Content-Disposition'] = f'attachment; filename*=UTF-8\'\'"{urllib.parse.quote(filename)}"'
    else:
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

    return response
