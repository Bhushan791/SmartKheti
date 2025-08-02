from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

from django.utils import timezone
from datetime import timedelta

class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required")
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('first_name', 'Admin')
        extra_fields.setdefault('last_name', '')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractUser):
    username = None  # Remove default username field
    phone = PhoneNumberField(unique=True, region='NP')

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    citizenship_number = models.CharField(max_length=20, blank=True, null=True, unique=True)

    province = models.CharField(max_length=50, blank=True, null=True)
    district = models.CharField(max_length=50, blank=True, null=True)
    municipality = models.CharField(max_length=100, blank=True, null=True)
    ward_number = models.PositiveSmallIntegerField(blank=True, null=True)

    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    preferred_language = models.CharField(
        max_length=10,
        choices=[('en', 'English'), ('np', 'Nepali')],
        default='np'
    )

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.phone})"





class OTPrequest(models.Model):
    phone = PhoneNumberField(region='NP')
    otp= models.CharField(max_length=6)
    created_at= models.DateTimeField(auto_now_add=True)



    def is_valid(self):
        expiration_time= self.created_at+ timedelta(minutes=2)
        current_time = timezone.now()
        if current_time<expiration_time:
            return True
        else:
            return False
        