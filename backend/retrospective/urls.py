from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RetrospectiveViewSet

router = DefaultRouter()
router.register(r'retrospectives', RetrospectiveViewSet)

urlpatterns = [
    path('', include(router.urls)),
]