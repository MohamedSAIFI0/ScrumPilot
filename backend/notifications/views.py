from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.exceptions import PermissionDenied
import logging

logger = logging.getLogger(__name__)

# 📩 Liste des notifications du user connecté
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(receiver=self.request.user).order_by('-created_at')
        logger.info(f"User {self.request.user.username} has {queryset.count()} notifications")
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} notifications for user {request.user.username}")
            return response
        except Exception as e:
            logger.error(f"Error listing notifications for user {request.user.username}: {e}")
            return Response(
                {"error": "Erreur lors du chargement des notifications"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ✅ Marquer une notification comme lue
class NotificationMarkAsReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.receiver != self.request.user:
            raise PermissionDenied("Vous ne pouvez pas modifier cette notification.")
        return obj

    def perform_update(self, serializer):
        notification = serializer.instance
        serializer.save(is_read=True)
        logger.info(f"Notification {notification.id} marked as read for user {self.request.user.username}")

    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            return Response({
                "message": "Notification marquée comme lue",
                "notification": response.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return Response(
                {"error": "Erreur lors de la mise à jour"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# 🗑️ Supprimer une notification
class NotificationDeleteView(generics.DestroyAPIView):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.receiver != self.request.user:
            raise PermissionDenied("Vous ne pouvez pas supprimer cette notification.")
        return obj

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            notification_id = instance.id
            self.perform_destroy(instance)
            logger.info(f"Notification {notification_id} deleted for user {request.user.username}")
            return Response(
                {"message": "Notification supprimée avec succès"}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error deleting notification: {e}")
            return Response(
                {"error": "Erreur lors de la suppression"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# 📊 Marquer toutes les notifications comme lues
class NotificationMarkAllAsReadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        try:
            updated_count = Notification.objects.filter(
                receiver=request.user, 
                is_read=False
            ).update(is_read=True)
            
            logger.info(f"{updated_count} notifications marked as read for user {request.user.username}")
            
            return Response({
                "message": f"{updated_count} notifications marquées comme lues",
                "updated_count": updated_count
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            return Response(
                {"error": "Erreur lors de la mise à jour"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# 📈 Statistiques des notifications
class NotificationStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            user_notifications = Notification.objects.filter(receiver=request.user)
            
            stats = {
                "total": user_notifications.count(),
                "unread": user_notifications.filter(is_read=False).count(),
                "read": user_notifications.filter(is_read=True).count(),
            }
            
            logger.info(f"Stats retrieved for user {request.user.username}: {stats}")
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting notification stats: {e}")
            return Response(
                {"error": "Erreur lors du chargement des statistiques"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )