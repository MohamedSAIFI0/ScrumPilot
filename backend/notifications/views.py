from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.exceptions import PermissionDenied

# 📩 Liste des notifications du user connecté
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(receiver=self.request.user).order_by('-created_at')

# ✅ Marquer une notification comme lue
class NotificationMarkAsReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        notification = serializer.instance
        if notification.receiver != self.request.user:
            raise PermissionDenied("Vous ne pouvez pas modifier cette notification.")
        serializer.save(is_read=True)
