from rest_framework import serializers
from .models import Blocage
from accounts.serializers import UserSerializer
from userstory.serializers import UserStorySerializer
from django.contrib.auth import get_user_model
from userstory.models import UserStory

User = get_user_model()

class BlocageSerializer(serializers.ModelSerializer):
    # Pour l'écriture, on n'accepte plus reported_by_id car il sera automatiquement assigné
    # task_id reste CharField car UserStory semble utiliser des UUID
    task_id = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    # Pour la lecture, on retourne les objets complets
    reported_by = UserSerializer(read_only=True)
    task = UserStorySerializer(read_only=True)
    
    class Meta:
        model = Blocage
        fields = '__all__'
        read_only_fields = ['reported_by', 'reported_at']  # Ces champs ne peuvent pas être modifiés
    
    def create(self, validated_data):
        # Extraire l'ID de la tâche
        task_id = validated_data.pop('task_id', None)
        
        # Récupérer l'instance de la tâche si l'ID est fourni
        if task_id:
            try:
                validated_data['task'] = UserStory.objects.get(id=task_id)
            except UserStory.DoesNotExist:
                raise serializers.ValidationError({"task_id": "User Story non trouvée"})
        
        # reported_by sera assigné automatiquement par perform_create dans la vue
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Extraire l'ID de la tâche
        task_id = validated_data.pop('task_id', None)
        
        # Mettre à jour la relation de tâche si l'ID est fourni
        if task_id is not None:
            if task_id:
                try:
                    validated_data['task'] = UserStory.objects.get(id=task_id)
                except UserStory.DoesNotExist:
                    raise serializers.ValidationError({"task_id": "User Story non trouvée"})
            else:
                validated_data['task'] = None
        
        # S'assurer que reported_by ne peut pas être modifié
        validated_data.pop('reported_by', None)
        
        return super().update(instance, validated_data)