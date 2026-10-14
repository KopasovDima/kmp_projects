import os

from config.logger import log_error


def save_uploaded_files_locally(request, save_dir):
    upload_results = {}

    files = request.FILES

    if not len(files):
        return upload_results

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    for file_name in files.keys():
        upload_results[file_name] = {
            'file_path': f'{save_dir}/{file_name}',
        }
        try:
            with open(upload_results[file_name]['file_path'], 'wb+') as file:
                for chunk in files[file_name].chunks():
                    file.write(chunk)
        except (Exception,) as e:
            log_error('File uploading error: ' + str(e) + '. Filename: ' + file_name)
            continue

    return upload_results
