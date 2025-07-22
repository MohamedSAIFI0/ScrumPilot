from rest_framework import viewsets
from .models import Sprint
from .serializers import SprintSerializer

from rest_framework.permissions import IsAuthenticated

class SprintViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer

    def perform_create(self, serializer):
        print(f"User creating sprint: {self.request.user} - Authenticated? {self.request.user.is_authenticated}")
        serializer.save(created_by=self.request.user)
