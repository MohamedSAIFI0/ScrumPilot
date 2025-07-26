from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Blocage
from .serializers import BlocageSerializer
from notifications.utils import notify_scrum_masters
import logging

logger = logging.getLogger(__name__)

class BlocageViewSet(viewsets.ModelViewSet):
    queryset = Blocage.objects.all()
    serializer_class = BlocageSerializer

    def perform_create(self, serializer):
        try:
            blocage = serializer.save()  
            logger.info(f"Blocage créé: {blocage.description}")
            notify_scrum_masters(
                title="🚨 Nouveau Blocage Signalé",
                message=f"Un nouveau blocage a été signalé : {blocage.description}.",
                notification_type='warning'
            )
            print(f"✅ Notification envoyée aux Scrum Masters pour le blocage: {blocage.description}")
        except Exception as e:
            logger.error(f"Erreur lors de la création du blocage: {e}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            logger.info("Appel API création blocage réussi")
            return response
        except Exception as e:
            logger.error(f"Erreur dans l'API création blocage: {e}")
            return Response(
                {"error": "Erreur lors de la création du blocage."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
