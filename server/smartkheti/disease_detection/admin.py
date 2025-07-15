from django.contrib import admin
from .models import DiseaseInfo, Product, DetectionRecord

class ProductInline(admin.TabularInline):
    model = Product
    extra = 1

@admin.register(DiseaseInfo)
class DiseaseInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'crop')
    search_fields = ('name', 'crop')
    inlines = [ProductInline]

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'disease')
    search_fields = ('name', 'disease__name')

@admin.register(DetectionRecord)
class DetectionRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'detected_disease', 'detected_at')
    list_filter = ('detected_at',)
    search_fields = ('user__phone', 'detected_disease')
