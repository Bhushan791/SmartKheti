from django.conf import settings
from django.db import models

class DiseaseInfo(models.Model):
    name = models.CharField(max_length=100)
    crop = models.CharField(max_length=50)
    short_remedy = models.TextField()
    treatment = models.TextField()
    recheck_advice = models.TextField()
    is_healthy = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.crop} - {self.name}"


class Product(models.Model):
    disease = models.ForeignKey(DiseaseInfo, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='products/')

    def __str__(self):
        return self.name




class DetectionRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='detections/')
    detected_disease = models.CharField(max_length=100)
    detected_at = models.DateTimeField(auto_now_add=True)






