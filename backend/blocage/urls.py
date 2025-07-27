from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlocageViewSet

router = DefaultRouter()
router.register(r'blocages', BlocageViewSet, basename='blocage')

urlpatterns = [
    path('', include(router.urls)),
]