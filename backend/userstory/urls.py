from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserStoryViewSet

router = DefaultRouter()
router.register(r'userstories', UserStoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]