from django.urls import path
from .views import ProductOwnerListAPIView

urlpatterns = [
    path('product-owners/', ProductOwnerListAPIView.as_view(), name='product-owner-list'),
]