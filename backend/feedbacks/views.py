from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Feedbacks
from .serializers import FeedbackSerializer
from notifications.utils import notify_developers, notify_product_owners, notify_scrum_masters


class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedbacks.objects.all()
    serializer_class = FeedbackSerializer


class FeedbackListView(generics.ListAPIView):
    queryset = Feedbacks.objects.all()
    serializer_class = FeedbackSerializer

    def get(self, request, *args, **kwargs):
        feedbacks = self.get_queryset()
        serializer = self.get_serializer(feedbacks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def perform_create(self, serializer):
        project = serializer.save()
        notify_developers(
            title="New Feedback Received",
            message=f"A new feedback has been received for project '{project.name}'."
        )
        notify_product_owners(
            title="New Feedback Received",
            message=f"A new feedback has been received for project '{project.name}'."
        )
        notify_scrum_masters(
            title="New Feedback Received",
            message=f"A new feedback has been received for project '{project.name}'."
        )
        
        


