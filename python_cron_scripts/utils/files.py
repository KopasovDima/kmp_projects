import hashlib
import os

def get_files(directory, filter_file_extension: str | None = None):
    files = []
    for file in os.listdir(directory):
        if filter_file_extension and not file.endswith(f'.{filter_file_extension}'):
            continue
        files.append(file)
    return sorted(files)


def get_file_hash_md5(filename):
    hash_md5 = hashlib.md5()
    with open(filename, 'rb') as file:
        for chunk in iter(lambda: file.read(4096), b''):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()
