from django.urls import path
from .views import ClientListAPIView


urlpatterns = [
    path('clients/', ClientListAPIView.as_view(), name='client-list'),
]