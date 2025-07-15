from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'id', 'first_name', 'last_name', 'phone', 'citizenship_number',
        'municipality', 'ward_number', 'preferred_language',
        'is_staff', 'is_active',
    )
    list_filter = ('is_staff', 'is_active', 'preferred_language')
    search_fields = ('first_name', 'last_name', 'phone', 'citizenship_number', 'municipality')
    ordering = ('id',)

    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'citizenship_number', 'profile_photo')
        }),
        ('Location', {
            'fields': ('municipality', 'ward_number')
        }),
        ('Preferences', {
            'fields': ('preferred_language',)
        }),
        ('Permissions', {
            'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'password1', 'password2'),
        }),
    )

    readonly_fields = ('last_login', 'date_joined')
