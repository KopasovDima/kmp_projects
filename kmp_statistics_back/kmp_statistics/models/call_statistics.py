from django.db import models

from kmp_statistics.models.user import User


class CallStatistics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    contacting_number = models.CharField(max_length=100)
    call_date = models.DateTimeField()
    duration = models.PositiveIntegerField()
    answered = models.BooleanField()
    call_type = models.CharField(max_length=50)

    def __str__(self):
        return f'{str(self.user)} - {self.contacting_number} ({self.call_date})'
