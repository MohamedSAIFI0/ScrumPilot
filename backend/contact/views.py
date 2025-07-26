from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Contact
from .serializers import ContactSerializer
from notifications.utils import notify_admins
import logging

logger = logging.getLogger(__name__)

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    http_method_names = ['get', 'post', 'put', 'delete']

    def perform_create(self, serializer):
        try:
            contact = serializer.save()
            logger.info(f"Contact créé: {contact.id}")
            notify_admins(
                title="📩 Nouveau message de contact",
                message="Un nouveau message de contact a été reçu.",
                notification_type='info'
            )
            print("✅ Notification envoyée aux admins.")
        except Exception as e:
            logger.error(f"Erreur lors de la création du contact: {e}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            logger.info("Appel API création contact réussi")
            return response
        except Exception as e:
            logger.error(f"Erreur dans l'API création contact: {e}")
            return Response(
                {"error": "Erreur lors de la création du contact."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
