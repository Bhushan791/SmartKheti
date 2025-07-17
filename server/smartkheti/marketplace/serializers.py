from rest_framework import serializers
from .models import CropListing, CropImage, Category


# ➕ Used for POST/PUT (Write only)
class CropListingSerializer(serializers.Serializer):
    crop_name = serializers.CharField(max_length=100)
    category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Category.objects.all()
    )
    quantity = serializers.CharField(max_length=50)
    rate = serializers.DecimalField(max_digits=10, decimal_places=2)
    location = serializers.CharField(max_length=100)
    contact_number = serializers.CharField()
    optional_contact = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    description = serializers.CharField(allow_blank=True)
    video = serializers.FileField(required=False, allow_null=True)
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True
    )

    def create(self, validated_data):
        images = validated_data.pop('images')
        farmer = self.context['request'].user
        listing = CropListing.objects.create(farmer=farmer, **validated_data)
        for image in images:
            CropImage.objects.create(listing=listing, image=image)
        return listing

    def update(self, instance, validated_data):
        images = validated_data.pop('images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images:
            instance.images.all().delete()
            for image in images:
                CropImage.objects.create(listing=instance, image=image)
        return instance
class CropImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropImage
        fields = ['image']

class CropListingReadSerializer(serializers.ModelSerializer):
    images = CropImageSerializer(many=True, read_only=True)
    category = serializers.SlugRelatedField(slug_field='name', read_only=True)
    farmer = serializers.SerializerMethodField()

    class Meta:
        model = CropListing
        fields = [
            'id', 'farmer', 'crop_name', 'category', 'quantity', 'rate',
            'location', 'contact_number', 'optional_contact',
            'description', 'video', 'date_posted', 'images'
        ]

    def get_farmer(self, obj):
        return f"{obj.farmer.first_name} {obj.farmer.last_name}".strip()
