from rest_framework import viewsets
from .models import Contact
from .serializers import ContactSerializer
from rest_framework.response import Response
from rest_framework import status

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    http_method_names = ['get', 'post', 'put', 'delete']