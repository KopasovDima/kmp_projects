from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from config import settings
from config.check_api import check

admin.site.site_url = 'https://iskmp.aokmp.ru/'

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/auth/', include('kmp_auth.urls')),
    path('api/', check),
    path('', check),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
