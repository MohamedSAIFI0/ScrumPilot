from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SprintViewSet

router = DefaultRouter()
router.register(r'sprints', SprintViewSet)

urlpatterns = [
    path('', include(router.urls)),
]