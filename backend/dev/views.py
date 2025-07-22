# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.models import User
from accounts.serializers import UserSerializer

class DevListAPIView(APIView):
    def get(self, request):
        dev = User.objects.filter(role='DEV')  
        serializer = UserSerializer(dev, many=True)
        return Response(serializer.data)
