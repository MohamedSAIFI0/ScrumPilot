from rest_framework import viewsets
from .models import Blocage
from .serializers import BlocageSerializer

class BlocageViewSet(viewsets.ModelViewSet):
    queryset = Blocage.objects.all()
    serializer_class = BlocageSerializer