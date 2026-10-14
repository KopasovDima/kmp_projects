from django.contrib import admin
from django.urls import include, path

from config.check_api import check

admin.site.site_url = 'http://dit/'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('kmp_statistics/', include('kmp_statistics.urls')),
    path('', check),
]
