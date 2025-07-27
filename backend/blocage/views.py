from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Blocage
from .serializers import BlocageSerializer
from notifications.utils import notify_scrum_masters
import logging

logger = logging.getLogger(__name__)

class BlocageViewSet(viewsets.ModelViewSet):
    queryset = Blocage.objects.all()  # Queryset par défaut pour le router
    serializer_class = BlocageSerializer
    permission_classes = [IsAuthenticated]  # S'assurer que l'utilisateur est authentifié

    def get_queryset(self):
        """
        Filtrer les blocages selon le rôle de l'utilisateur :
        - Scrum Master : voit tous les blocages
        - Autres utilisateurs : voient seulement leurs propres blocages
        """
        user = self.request.user
        
        # Si l'utilisateur est un Scrum Master, il voit tous les blocages
        if user.role == 'SM':
            return Blocage.objects.all().order_by('-reported_at')
        
        # Sinon, l'utilisateur ne voit que ses propres blocages
        return Blocage.objects.filter(reported_by=user).order_by('-reported_at')

    def perform_create(self, serializer):
        try:
            # Automatiquement assigner l'utilisateur connecté comme reported_by
            blocage = serializer.save(reported_by=self.request.user)  
            logger.info(f"Blocage créé par {self.request.user.username}: {blocage.description}")
            notify_scrum_masters(
                title="🚨 Nouveau Blocage Signalé",
                message=f"Un nouveau blocage a été signalé par {self.request.user.username} : {blocage.description}.",
                notification_type='warning'
            )
            print(f"✅ Notification envoyée aux Scrum Masters pour le blocage: {blocage.description}")
        except Exception as e:
            logger.error(f"Erreur lors de la création du blocage: {e}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f"Appel API création blocage réussi pour {request.user.username}")
            return response
        except Exception as e:
            logger.error(f"Erreur dans l'API création blocage: {e}")
            return Response(
                {"error": "Erreur lors de la création du blocage."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )