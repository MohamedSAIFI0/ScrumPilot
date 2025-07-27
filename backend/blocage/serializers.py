from rest_framework import serializers
from .models import Blocage
from accounts.serializers import UserSerializer
from userstory.serializers import UserStorySerializer
from django.contrib.auth import get_user_model
from userstory.models import UserStory

User = get_user_model()

class BlocageSerializer(serializers.ModelSerializer):
    # Pour l'écriture, on accepte les ID
    # Votre User utilise un ID auto-incrémenté (IntegerField par défaut)
    reported_by_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    # task_id reste CharField car UserStory semble utiliser des UUID
    task_id = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    # Pour la lecture, on retourne les objets complets
    reported_by = UserSerializer(read_only=True)
    task = UserStorySerializer(read_only=True)
    
    class Meta:
        model = Blocage
        fields = '__all__'
    
    def create(self, validated_data):
        # Extraire les ID des champs write_only
        reported_by_id = validated_data.pop('reported_by_id', None)
        task_id = validated_data.pop('task_id', None)
        
        # Récupérer les instances si les ID sont fournis
        if reported_by_id:
            try:
                validated_data['reported_by'] = User.objects.get(id=reported_by_id)
            except User.DoesNotExist:
                raise serializers.ValidationError({"reported_by_id": "Utilisateur non trouvé"})
        
        if task_id:
            try:
                validated_data['task'] = UserStory.objects.get(id=task_id)
            except UserStory.DoesNotExist:
                raise serializers.ValidationError({"task_id": "User Story non trouvée"})
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Extraire les ID des champs write_only
        reported_by_id = validated_data.pop('reported_by_id', None)
        task_id = validated_data.pop('task_id', None)
        
        # Mettre à jour les relations si les ID sont fournis
        if reported_by_id is not None:
            if reported_by_id:
                try:
                    validated_data['reported_by'] = User.objects.get(id=reported_by_id)
                except User.DoesNotExist:
                    raise serializers.ValidationError({"reported_by_id": "Utilisateur non trouvé"})
            else:
                validated_data['reported_by'] = None
        
        if task_id is not None:
            if task_id:
                try:
                    validated_data['task'] = UserStory.objects.get(id=task_id)
                except UserStory.DoesNotExist:
                    raise serializers.ValidationError({"task_id": "User Story non trouvée"})
            else:
                validated_data['task'] = None
        
        return super().update(instance, validated_data)