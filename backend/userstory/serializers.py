from rest_framework import serializers
from .models import UserStory
from epic.serializers import EpicSerializer
from sprints.serializers import SprintSerializer

class UserStorySerializer(serializers.ModelSerializer):
    epic = EpicSerializer(read_only=True)
    sprint =  SprintSerializer(read_only=True)
    class Meta:
        model = UserStory
        fields = '__all__'

    