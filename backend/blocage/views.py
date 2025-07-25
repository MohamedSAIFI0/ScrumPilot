from rest_framework import viewsets
from .models import Blocage
from .serializers import BlocageSerializer
from notifications.utils import notify_scrum_masters

class BlocageViewSet(viewsets.ModelViewSet):
    queryset = Blocage.objects.all()
    serializer_class = BlocageSerializer

    def perform_create(self, serializer):
        blocage = serializer.save()
        notify_scrum_masters(
            title="New Blocage Reported",
            message=f"A new blocage has been reported: {blocage.description}."
        )