from rest_framework import viewsets
from .models import UserStory
from .serializers import UserStorySerializer

class UserStoryViewSet(viewsets.ModelViewSet):
    queryset = UserStory.objects.all()
    serializer_class = UserStorySerializer