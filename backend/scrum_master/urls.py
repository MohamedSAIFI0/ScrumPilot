from django.urls import path
from .views import ScrumMasterListAPIView

urlpatterns = [
    path('scrum-masters/', ScrumMasterListAPIView.as_view(), name='scrum-master-list'),
]
