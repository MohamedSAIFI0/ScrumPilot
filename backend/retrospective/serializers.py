from rest_framework import serializers
from .models import Retrospective
from accounts.serializers import UserSerializer

class RetrospectiveSerializer(serializers.ModelSerializer):
    submitted_by = UserSerializer(read_only=True)
    class Meta:
        model = Retrospective
        fields = '__all__'