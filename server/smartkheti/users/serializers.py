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
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
