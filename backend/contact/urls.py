from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet

router = DefaultRouter()
router.register(r'contact', ContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
