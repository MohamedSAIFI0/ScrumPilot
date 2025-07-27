import logging
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Feedbacks
from .serializers import FeedbackSerializer
from notifications.utils import notify_scrum_masters

logger = logging.getLogger(__name__)

class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedbacks.objects.all()
    serializer_class = FeedbackSerializer

    def perform_create(self, serializer):
        try:
            feedback = serializer.save()
            
            # Accéder au projet via la user story
            project_name = "N/A"
            if feedback.userstory and hasattr(feedback.userstory, 'sprint') and feedback.userstory.sprint:
                # Si la user story a un sprint, récupérer le projet du sprint
                project_name = feedback.userstory.sprint.project.name
            elif feedback.userstory and hasattr(feedback.userstory, 'project'):
                # Si la user story a une relation directe avec le projet
                project_name = feedback.userstory.project.name
            
            logger.info(f"💬 Nouveau feedback reçu pour le projet : {project_name}")

            notify_scrum_masters(
                title="💬 Nouveau feedback reçu",
                message=f"Un nouveau feedback a été soumis pour le projet '{project_name}'.",
                notification_type="info"
            )
            print(f"✅ Notification envoyée au Scrum Master pour le projet {project_name}")
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'enregistrement du feedback : {e}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            logger.info("✅ Appel API création feedback réussi")
            return response
        except Exception as e:
            logger.error(f"❌ Erreur dans l'API création feedback : {e}")
            return Response(
                {"error": "Erreur lors de la création du feedback."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FeedbackListView(generics.ListAPIView):
    queryset = Feedbacks.objects.all()
    serializer_class = FeedbackSerializer

    def get(self, request, *args, **kwargs):
        try:
            feedbacks = self.get_queryset()
            serializer = self.get_serializer(feedbacks, many=True)
            logger.info("✅ Liste des feedbacks récupérée")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"❌ Erreur lors de la récupération des feedbacks : {e}")
            return Response(
                {"error": "Impossible de récupérer les feedbacks."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )