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

# 🔧 FIXED: This serializer now returns full URLs
class CropImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = CropImage
        fields = ['image']
    
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

# 🔧 FIXED: This serializer now handles video URLs and passes context
class CropListingReadSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    category = serializers.SlugRelatedField(slug_field='name', read_only=True)
    farmer = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = CropListing
        fields = [
            'id', 'farmer', 'crop_name', 'category', 'quantity', 'rate',
            'location', 'contact_number', 'optional_contact',
            'description', 'video', 'date_posted', 'images'
        ]

    def get_farmer(self, obj):
        return f"{obj.farmer.first_name} {obj.farmer.last_name}".strip()
    
    def get_images(self, obj):
        request = self.context.get('request')
        images = obj.images.all()
        return CropImageSerializer(images, many=True, context={'request': request}).data
    
    def get_video(self, obj):
        request = self.context.get('request')
        if obj.video and request:
            return request.build_absolute_uri(obj.video.url)
        return None