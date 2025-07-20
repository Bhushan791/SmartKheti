# weather/models.py

from django.db import models
from django.conf import settings

class SavedLocation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_locations')
    name = models.CharField(max_length=100, help_text="Label for this location, e.g. 'My Rice Field'")
    province = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    municipality = models.CharField(max_length=100)
    ward_number = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'name']  # Optional: prevent same name reuse

    def __str__(self):
        return f"{self.name} ({self.user.phone})"
