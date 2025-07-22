from rest_framework import serializers
from .models import UserStory

class UserStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStory
        fields = '__all__'

    def validate(self, data):
        if data['points'] < 1 or data['points'] > 21:
            raise serializers.ValidationError("Les points doivent être entre 1 et 21.")
        return data