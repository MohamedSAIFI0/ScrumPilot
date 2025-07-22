from rest_framework import serializers
from .models import Dev

class DevSerializer(serializers.ModelSerializer):
    model = Dev
    fields = ['id','name']