from PIL import Image
from django.core.files import File

from kmp_auth.exceptions.bad_request_exception import BadRequestException


def is_valid_image(file_path):
    try:
        with Image.open(file_path) as img:
            img.verify()
    except (IOError, SyntaxError, Exception):
        raise BadRequestException('Недопустимый формат фотографии')


def attach_photo(user_profile, file_path, file_name):
    if not user_profile:
        raise BadRequestException('Не найден профиль пользователя')

    if user_profile.photo:
        user_profile.photo.delete(save=True)

    with Image.open(file_path) as img:
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, 'white')
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background

        width, height = img.size

        max_side = max(width, height)

        square_img = Image.new('RGB', (max_side, max_side), 'white')

        x_offset = (max_side - width) // 2
        y_offset = (max_side - height) // 2

        square_img.paste(img, (x_offset, y_offset))

        square_img = square_img.resize((300, 300), Image.Resampling.LANCZOS)

        square_img.save(file_path)

    with open(file_path, 'rb') as f:
        user_profile.photo.save(file_name, File(f))

