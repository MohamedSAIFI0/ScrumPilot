from rest_framework import serializers
from .models import Blocage

class BlocageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blocage
        fields = '__all__'