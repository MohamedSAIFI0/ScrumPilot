# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.models import User
from accounts.serializers import UserSerializer

class ProductOwnerListAPIView(APIView):
    def get(self, request):
        product_owners = User.objects.filter(role='PO')  # 'PO' pour Product Owner
        serializer = UserSerializer(product_owners, many=True)
        return Response(serializer.data)
