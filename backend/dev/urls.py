from django.urls import path
from .views import DevListAPIView

urlpatterns = [
    path('dev/', DevListAPIView.as_view(), name='product-owner-list'),
]