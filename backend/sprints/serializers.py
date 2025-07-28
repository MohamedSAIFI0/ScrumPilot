from rest_framework import serializers
from .models import Sprint
from projects.serializers import ProjectSerializer
from projects.models import Project

class SprintSerializer(serializers.ModelSerializer):
    # Lecture seule pour afficher les détails du projet
    project = ProjectSerializer(read_only=True)
    
    # Écriture seule pour permettre la création via project_id
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        source='project',  # mappe à l'attribut `project` du modèle
        write_only=True
    )

    class Meta:
        model = Sprint
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by')
