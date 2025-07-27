from rest_framework import serializers
from .models import Feedbacks
from client.serializers import ClientSerializer

class FeedbackSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    class Meta:
        model = Feedbacks
        fields = '__all__'