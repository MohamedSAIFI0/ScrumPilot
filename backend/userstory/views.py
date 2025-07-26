from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserStory
from .serializers import UserStorySerializer
from notifications.utils import notify_scrum_masters, notify_developers, notify_product_owners
import logging

logger = logging.getLogger(__name__)

class UserStoryViewSet(viewsets.ModelViewSet):
    queryset = UserStory.objects.all()
    serializer_class = UserStorySerializer

    def perform_create(self, serializer):
        try:
            user_story = serializer.save()
            logger.info(f"User Story créée: {user_story.title}")

            notify_scrum_masters(
                title="📝 Nouvelle User Story créée",
                message=f"Une nouvelle user story '{user_story.title}' a été créée.",
                notification_type='info'
            )
            notify_developers(
                title="📝 Nouvelle User Story créée",
                message=f"Une nouvelle user story '{user_story.title}' a été créée.",
                notification_type='info'
            )
            notify_product_owners(
                title="📝 Nouvelle User Story créée",
                message=f"Une nouvelle user story '{user_story.title}' a été créée.",
                notification_type='info'
            )

            print(f"✅ Notifications envoyées pour la user story '{user_story.title}'")

        except Exception as e:
            logger.error(f"Erreur lors de la création de la user story: {e}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            logger.info("Appel API création user story réussi")
            return response
        except Exception as e:
            logger.error(f"Erreur dans l'API création user story: {e}")
            return Response(
                {"error": "Erreur lors de la création de la user story."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
