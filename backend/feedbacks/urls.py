from django.urls import path, include
from .views import FeedbackCreateView, FeedbackListView

urlpatterns = [
    path('feedback/create', FeedbackCreateView.as_view(), name='feedback-create'),
    path('feedback/',FeedbackListView.as_view(), name='feedback-list')
]