from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from config import settings
from config.change_password import change_admin_user_password
from config.check_api import check
from config.download_media import download_media
from config.env import env
from config.remove_unused_attachment_files import remove_all_unused_attachments
from is_kmp.utils.check_lib_installed import is_debug_toolbar_install

admin.site.site_url = 'https://iskmp.aokmp.ru'

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/admin_user/change_password/', change_admin_user_password),
    path('api/is_kmp/', include('is_kmp.urls')),
    path('api/download_media/<path:file_path>', download_media),
    path('api/remove_unused_attachments/', remove_all_unused_attachments),
    path('api/', check),
    path('', check),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if env.DJANGO_DEBUG and is_debug_toolbar_install():
    from debug_toolbar.toolbar import debug_toolbar_urls

    urlpatterns = urlpatterns + debug_toolbar_urls()
