from rest_framework import serializers
from .models import Epic

class EpicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Epic
        fields = '__all__'

