# Dans votre userstory/serializers.py

from rest_framework import serializers
from .models import UserStory
from epic.serializers import EpicSerializer
from sprints.serializers import SprintSerializer
from epic.models import Epic
from sprints.models import Sprint

class UserStorySerializer(serializers.ModelSerializer):
    # Lecture seule pour afficher les détails complets
    epic = EpicSerializer(read_only=True)
    sprint = SprintSerializer(read_only=True)
    
    # Écriture seule pour permettre la création/modification via IDs
    epic_id = serializers.PrimaryKeyRelatedField(
        queryset=Epic.objects.all(),
        source='epic',
        write_only=True
    )
    sprint_id = serializers.PrimaryKeyRelatedField(
        queryset=Sprint.objects.all(),
        source='sprint',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = UserStory
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
        
    def create(self, validated_data):
        return UserStory.objects.create(**validated_data)
        
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance