from rest_framework import viewsets
from .models import Retrospective
from .serializers import RetrospectiveSerializer
from notifications.utils import notify_scrum_masters

class RetrospectiveViewSet(viewsets.ModelViewSet):
    queryset = Retrospective.objects.all()
    serializer_class = RetrospectiveSerializer

    def perform_create(self, serializer):
        retrospective = serializer.save()
        notify_scrum_masters(
            title="New Retrospective Created",
            message=f"A new retrospective has been created for sprint {retrospective.sprint.name}."
        )

    def perform_update(self, serializer):
        retrospective = serializer.save()
        notify_scrum_masters(
            title="Retrospective Updated",
            message=f"The retrospective for sprint {retrospective.sprint.name} has been updated."
        )

