from rest_framework import viewsets
from .models import Sprint
from .serializers import SprintSerializer

from rest_framework.permissions import IsAuthenticated
from notifications.utils import notify_scrum_masters, notify_product_owners, notify_developers

class SprintViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer

    def perform_create(self, serializer):
        print(f"User creating sprint: {self.request.user} - Authenticated? {self.request.user.is_authenticated}")
        serializer.save(created_by=self.request.user)

        sprint = serializer.save()
        notify_scrum_masters(
            title="New Sprint Created",
            message=f"A new sprint '{sprint.name}' has been created."
        )
        notify_product_owners(
            title="New Sprint Created",
            message=f"A new sprint '{sprint.name}' has been created."
        )
        notify_developers(
            title="New Sprint Created",
            message=f"A new sprint '{sprint.name}' has been created."
        )
