# notifications/urls.py
from django.urls import path
from .views import (
    NotificationListView, 
    NotificationMarkAsReadView, 
    NotificationDeleteView,
    NotificationMarkAllAsReadView,
    NotificationStatsView
)

urlpatterns = [
    # 📩 Lister toutes les notifications
    path('', NotificationListView.as_view(), name='notifications-list'),
    
    # ✅ Marquer une notification comme lue
    path('<int:pk>/read/', NotificationMarkAsReadView.as_view(), name='notification-read'),
    
    # 🗑️ Supprimer une notification
    path('<int:pk>/', NotificationDeleteView.as_view(), name='notification-delete'),
    
    # ✅ Marquer toutes les notifications comme lues (optionnel)
    path('mark-all-read/', NotificationMarkAllAsReadView.as_view(), name='notifications-mark-all-read'),
    
    # 📈 Statistiques des notifications (optionnel)
    path('stats/', NotificationStatsView.as_view(), name='notifications-stats'),
]