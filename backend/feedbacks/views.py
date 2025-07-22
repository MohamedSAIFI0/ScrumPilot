from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Feedbacks
from .serializers import FeedbackSerializer


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