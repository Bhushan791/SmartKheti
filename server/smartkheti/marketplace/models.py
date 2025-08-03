# marketplace/models.py
from django.db import models
from django.conf import settings
from phonenumber_field.modelfields import PhoneNumberField
from cloudinary_storage.storage import VideoMediaCloudinaryStorage # <-- NEW: Import the video storage class
from cloudinary.models import CloudinaryField # <-- NEW: You might need this for image fields if you want to use it instead of ImageField

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class CropListing(models.Model):
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    crop_name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    quantity = models.CharField(max_length=50)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100)
    contact_number = PhoneNumberField(region='NP')
    optional_contact = PhoneNumberField(unique=True, region='NP', null=True, blank=True)
    description = models.TextField(blank=True)
    
    # --- CHANGE THIS LINE ---
    # The new field will explicitly use the video storage backend
    video = models.FileField(upload_to='marketplace/crop_videos/', blank=True, null=True, storage=VideoMediaCloudinaryStorage())
    
    date_posted = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_name} by {self.farmer.first_name}"

class CropImage(models.Model):
    listing = models.ForeignKey(CropListing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='marketplace/crop_images/')

    def __str__(self):
        return f"image for {self.listing.crop_name}"