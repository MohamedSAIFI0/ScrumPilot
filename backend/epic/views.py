from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Epic
from .serializers import EpicSerializer
from notifications.utils import notify_scrum_masters, notify_product_owners, notify_developers, notify_admins

class EpicViewSet(viewsets.ModelViewSet):
    queryset = Epic.objects.all()
    serializer_class = EpicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['projet']  

    def perform_create(self, serializer):
        epic = serializer.save()
        notify_scrum_masters(
            title="New Epic Created",
            message=f"A new epic '{epic.name}' has been created."
        )
        notify_product_owners(
            title="New Epic Created",
            message=f"A new epic '{epic.name}' has been created."
        )
        notify_developers(
            title="New Epic Created",
            message=f"A new epic '{epic.name}' has been created."
        )
        notify_admins(
            title="New Epic Created",
            message=f"A new epic '{epic.name}' has been created."
        )
