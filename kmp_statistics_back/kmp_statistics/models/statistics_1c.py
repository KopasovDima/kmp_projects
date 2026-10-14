from django.db import models

from kmp_statistics.models.department import Department


class Statistics1C(models.Model):
    _1c_department = models.ForeignKey(Department, on_delete=models.DO_NOTHING, null=True, blank=True)
    _1c_user = models.CharField(null=True, blank=True)

    year = models.IntegerField()
    month = models.IntegerField()
    parameter = models.CharField()
    value = models.IntegerField()
