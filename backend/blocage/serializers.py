from rest_framework import serializers
from .models import Blocage
from accounts.serializers import UserSerializer
from userstory.serializers import UserStorySerializer

class BlocageSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    task = UserStorySerializer(read_only=True)
    
    class Meta:
        model = Blocage
        fields = '__all__'