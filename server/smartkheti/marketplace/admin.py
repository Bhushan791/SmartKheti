from django.contrib import admin
from .models import Category, CropListing, CropImage

# Inline images for better listing preview
class CropImageInline(admin.TabularInline):
    model = CropImage
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

@admin.register(CropListing)
class CropListingAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'crop_name', 'farmer', 'category', 'quantity',
        'rate', 'location', 'date_posted'
    ]
    list_filter = ['category', 'location', 'date_posted']
    search_fields = ['crop_name', 'location', 'farmer__first_name', 'farmer__last_name']
    inlines = [CropImageInline]
    readonly_fields = ['date_posted']
