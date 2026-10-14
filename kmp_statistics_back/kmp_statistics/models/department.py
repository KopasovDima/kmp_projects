from django.db import models


class Department(models.Model):
    _1c_uuid = models.UUIDField(
        unique=True,
        db_index=True,
        primary_key=True,
    )
    sprav_id = models.PositiveSmallIntegerField(blank=True, null=True)
    name = models.CharField(max_length=200)

    def __str__(self):
        return f'{self.name} ({self.sprav_id} / {self._1c_uuid})'
