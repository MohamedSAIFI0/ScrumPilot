from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EpicViewSet

router = DefaultRouter()
router.register(r'epics', EpicViewSet)

urlpatterns = [
    path('', include(router.urls)),
]