from rest_framework import serializers
from .models import Retrospective

class RetrospectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retrospective
        fields = '__all__'