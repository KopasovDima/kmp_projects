from django.db import models


class RedmineStatistics(models.Model):
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()

    issue_id = models.PositiveIntegerField()
    project_id = models.PositiveIntegerField()
    project_name = models.CharField()
    status_id = models.PositiveIntegerField()
    status_name = models.CharField()
    priority_id = models.PositiveIntegerField()
    priority_name = models.CharField()
    subject = models.CharField()
    description = models.CharField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    created_on = models.DateTimeField(blank=True, null=True)
    updated_on = models.DateTimeField(blank=True, null=True)
    assigned_to_id = models.PositiveIntegerField(blank=True, null=True)
    assigned_to_name = models.CharField(blank=True, null=True)
    author_id = models.PositiveIntegerField(blank=True, null=True)
    author_name = models.CharField(blank=True, null=True)

    def __str__(self):
        return f'{str(self.issue_id)} ({self.year}-{self.month})'
