from django.db import models


class User(models.Model):
    phone_number = models.IntegerField(
        unique=True,
        db_index=True,
        primary_key=True,
    )
    user_name = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.user_name} - {self.phone_number}'
