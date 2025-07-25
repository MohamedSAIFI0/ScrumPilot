from rest_framework import viewsets
from .models import UserStory
from .serializers import UserStorySerializer
from notifications.utils import notify_scrum_masters, notify_developers, notify_product_owners

class UserStoryViewSet(viewsets.ModelViewSet):
    queryset = UserStory.objects.all()
    serializer_class = UserStorySerializer

    def perform_create(self, serializer):
        user_story = serializer.save()
        notify_scrum_masters(
            title="New User Story Created",
            message=f"A new user story '{user_story.title}' has been created."
        )
        notify_developers(
            title="New User Story Created",
            message=f"A new user story '{user_story.title}' has been created."
        )
        notify_product_owners(
            title="New User Story Created",
            message=f"A new user story '{user_story.title}' has been created."
        )