from rest_framework import viewsets
from .models import Retrospective
from .serializers import RetrospectiveSerializer

class RetrospectiveViewSet(viewsets.ModelViewSet):
    queryset = Retrospective.objects.all()
    serializer_class = RetrospectiveSerializer