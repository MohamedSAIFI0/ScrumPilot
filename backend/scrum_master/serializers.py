from rest_framework import serializers
from .models import ScrumMaster

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumMaster
        fields = ['id', 'name',]
