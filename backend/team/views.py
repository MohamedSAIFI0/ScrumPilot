from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Team
from .serializers import TeamSerializer
from notifications.utils import notify_developers, notify_admins, notify_scrum_masters, notify_product_owners
import logging

logger = logging.getLogger(__name__)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def perform_create(self, serializer):
        try:
            team = serializer.save()
            logger.info(f"Equipe créée: {team.name}")

            notify_developers(
                title="👥 Nouvelle équipe créée",
                message=f"Une nouvelle équipe '{team.name}' a été créée.",
                notification_type='info'
            )
            notify_product_owners(
                title="👥 Nouvelle équipe créée",
                message=f"Une nouvelle équipe '{team.name}' a été créée.",
                notification_type='info'
            )
            notify_scrum_masters(
                title="👥 Nouvelle équipe créée",
                message=f"Une nouvelle équipe '{team.name}' a été créée.",
                notification_type='info'
            )
            notify_admins(
                title="👥 Nouvelle équipe créée",
                message=f"Une nouvelle équipe '{team.name}' a été créée.",
                notification_type='warning'
            )
            print(f"✅ Notifications envoyées pour l'équipe '{team.name}'")

        except Exception as e:
            logger.error(f"Erreur lors de la création de l'équipe: {e}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            logger.info("Appel API création équipe réussi")
            return response
        except Exception as e:
            logger.error(f"Erreur dans l'API création équipe: {e}")
            return Response(
                {"error": "Erreur lors de la création de l'équipe."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
