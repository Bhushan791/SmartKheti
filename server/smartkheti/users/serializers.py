from rest_framework import serializers
from .models import User
from phonenumber_field.serializerfields import PhoneNumberField

class UserSerializer(serializers.ModelSerializer):
    phone = PhoneNumberField(region='NP')

    class Meta:
        model = User
        fields = [
            'id', 'phone', 'first_name', 'last_name', 'citizenship_number',
            'province', 'district', 'municipality', 'ward_number',
            'profile_photo', 'preferred_language',
            'password',
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
        }

    def create(self, validated_data):
        print("Create called with:", validated_data)  #debug  
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        print("Update called with:", validated_data)   ##debug
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def validate_phone(self, value):
        print("Validating phone:", value)  #debug
        
        # Get the current instance (if updating)
        instance = getattr(self, 'instance', None)
        
        # Check if phone exists, excluding current instance
        queryset = User.objects.filter(phone=value)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Account with this phone number already registered")
        return value

    def validate_citizenship_number(self, value):
        print("Validating citizenship_number:", value)   # DEBUG
        
        # Skip validation if value is empty/None
        if not value:
            return value
            
        # Get the current instance (if updating)
        instance = getattr(self, 'instance', None)
        
        # Check if citizenship number exists, excluding current instance
        queryset = User.objects.filter(citizenship_number=value)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Citizenship Number already registered")
        return value