from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import ProfilSerializer
from .models import Profil

class MyProfileView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        profil = Profil.objects.get(user=request.user)
        serializer = ProfilSerializer(profil)
        return Response(serializer.data)
