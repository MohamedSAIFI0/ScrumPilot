from django.urls import path
from . import views

urlpatterns = [
    # 💬 Gestion des conversations
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/create/', views.CreateConversationView.as_view(), name='create-conversation'),
    path('conversations/direct/', views.CreateDirectConversationView.as_view(), name='create-direct-conversation'),
    path('conversations/<int:conversation_id>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/read/', views.mark_conversation_read, name='mark-conversation-read'),
    
    # 👥 Gestion des participants
    path('conversations/<int:conversation_id>/participants/', views.AddParticipantView.as_view(), name='add-participant'),
    path('conversations/<int:conversation_id>/leave/', views.LeaveConversationView.as_view(), name='leave-conversation'),
    
    # 📝 Gestion des messages
    path('conversations/<int:conversation_id>/messages/', views.SendMessageView.as_view(), name='send-message'),
    path('messages/<int:message_id>/edit/', views.EditMessageView.as_view(), name='edit-message'),
    path('messages/<int:message_id>/delete/', views.DeleteMessageView.as_view(), name='delete-message'),
    
    # 😊 Réactions aux messages
    path('messages/<int:message_id>/reactions/', views.MessageReactionView.as_view(), name='message-reactions'),
    
    # 📊 Statut utilisateur
    path('status/', views.UserStatusView.as_view(), name='user-status'),
    
    # 🔍 Recherche d'utilisateurs
    path('users/search/', views.SearchUsersView.as_view(), name='search-users'),
]