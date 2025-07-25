from rest_framework import viewsets
from .models import Project
from .serializers import ProjectSerializer
from notifications.utils import notify_developers, notify_product_owners, notify_scrum_masters, notify_admins

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        project = serializer.save()
        notify_developers(
            title="New Project Created",
            message=f"A new project '{project.name}' has been created."
        )

        notify_product_owners(
            title="New Project Created",
            message=f"A new project '{project.name}' has been created."
        )

        notify_scrum_masters(
            title="New Project Created",
            message=f"A new project '{project.name}' has been created."
        )

        notify_admins(
            title="New Project Created",
            message=f"A new project '{project.name}' has been created."
        )
