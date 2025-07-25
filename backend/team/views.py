from rest_framework import viewsets
from .models import Team
from .serializers import TeamSerializer
from notifications.utils import notify_developers, notify_admins, notify_scrum_masters, notify_product_owners

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def perform_create(self, serializer):
        team = serializer.save()
        notify_developers(
            title="New Team Created",
            message=f"A new team '{team.name}' has been created."
        )

        notify_product_owners(
            title="New Team Created",
            message=f"A new team '{team.name}' has been created."
        )

        notify_scrum_masters(
            title="New Team Created",
            message=f"A new team '{team.name}' has been created."
        )

        notify_admins(
            title="New Team Created",
            message=f"A new team '{team.name}' has been created."
        )

