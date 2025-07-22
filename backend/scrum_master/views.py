# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated  # optionnel
from accounts.models import User
from accounts.serializers import UserSerializer

class ScrumMasterListAPIView(APIView):
    #permission_classes = [IsAuthenticated]  # optionnel

    def get(self, request):
        scrum_masters = User.objects.filter(role='SM')
        serializer = UserSerializer(scrum_masters, many=True)
        return Response(serializer.data)
