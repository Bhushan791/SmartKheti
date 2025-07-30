
import mysql.connector.django
from pathlib import Path
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-1kv9f96ay&==fbq-&h-y1_@q$%rx@le_(!nj81m7*)noz#mypp'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'corsheaders',
    'django.contrib.staticfiles',
    'phonenumber_field',
    'rest_framework',
    'rest_framework_simplejwt',
    'users',
    'disease_detection',
    'weather',
    'marketplace',
    'reports'
]






## REST FRAMEWORK 

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}




##JWT TIME-SESSION MANAGAMENT

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=20),  # <-- Increase this as needed
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),     # Optional, if using refresh tokens
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# Phone number field default
PHONENUMBER_DEFAULT_REGION = 'NP'





##MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True









##URLS ROOT 
ROOT_URLCONF = 'core.urls'





##AUTH USER MODEL
AUTH_USER_MODEL = 'users.User'

##TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
















##WSGI APPS
WSGI_APPLICATION = 'core.wsgi.application'







##DATABASE
# DATABASES = {
#     'default': {
#         'ENGINE': 'mysql.connector.django',  # 👈 engine
#         'NAME': 'smartkheti',
#         'USER': 'root',           
#         'PASSWORD': 'bhushanbhatta',
#         'HOST': 'localhost',
#         'PORT': '3306',
#         'OPTIONS': {
#             'autocommit': True,
#         }
#     }
# }



DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # default PostgreSQL backend
        'NAME': 'smartkheti',
        'USER': 'postgres',
        'PASSWORD': 'bhushanbhatta',
        'HOST': 'localhost',
        'PORT': '5432',
        # Remove OPTIONS or keep it empty if not needed
    }
}






##VALIDATIONS
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files (User uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # This is correct

# Make sure this is consistent throughout
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Add these for better media handling
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

##time zone
TIME_ZONE = 'Asia/Kathmandu'