from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Retrospective
from .serializers import RetrospectiveSerializer
from notifications.utils import notify_scrum_masters
import logging

logger = logging.getLogger(__name__)

class RetrospectiveViewSet(viewsets.ModelViewSet):
    queryset = Retrospective.objects.all()
    serializer_class = RetrospectiveSerializer

    def perform_create(self, serializer):
        try:
            retrospective = serializer.save()
            logger.info(f"📝 Nouvelle rétrospective créée pour le sprint : {retrospective.sprint.name}")

            notify_scrum_masters(
                title="📝 Nouvelle rétrospective créée",
                message=f"Une nouvelle rétrospective a été créée pour le sprint {retrospective.sprint.name}.",
                notification_type='info'
            )
            print(f"✅ Notification envoyée au Scrum Master pour le sprint {retrospective.sprint.name}")

        except Exception as e:
            logger.error(f"❌ Erreur lors de la création de la rétrospective : {e}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            logger.info("✅ Appel API création rétrospective réussi")
            return response
        except Exception as e:
            logger.error(f"❌ Erreur dans l'API création rétrospective : {e}")
            return Response(
                {"error": "Erreur lors de la création de la rétrospective."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
