from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max
from django.utils import timezone

from .models import Conversation, Message, ConversationParticipant, MessageReaction, UserStatus
from accounts.models import User
from .serializers import (
    ConversationSerializer, MessageSerializer, CreateMessageSerializer,
    CreateConversationSerializer, CreateDirectConversationSerializer,
    UpdateUserStatusSerializer, UserStatusSerializer, MessageReactionSerializer
)


# 💬 Récupérer toutes les conversations de l'utilisateur connecté
class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            conversationparticipant__user=request.user
        ).prefetch_related('participants', 'messages').distinct()
        
        serializer = ConversationSerializer(
            conversations, 
            many=True, 
            context={'request': request}
        )
        
        return Response({
            'message': 'Conversations récupérées avec succès ✅',
            'count': conversations.count(),
            'conversations': serializer.data
        }, status=200)


# 💬 Créer une nouvelle conversation de groupe
class CreateConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateConversationSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            conversation = serializer.save()
            return Response({
                'message': 'Conversation créée avec succès ✅',
                'conversation': ConversationSerializer(
                    conversation, 
                    context={'request': request}
                ).data
            }, status=201)
        
        return Response(serializer.errors, status=400)


# 💬 Créer ou récupérer une conversation directe
class CreateDirectConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateDirectConversationSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            conversation = serializer.save()
            
            # ✅ Retourner la conversation complète avec tous les détails
            conversation_data = ConversationSerializer(
                conversation,
                context={'request': request}
            ).data
            
            # ✅ Déterminer si c'est une nouvelle conversation ou existante
            is_new = not hasattr(serializer, '_existing_conversation')
            
            return Response({
                'message': 'Conversation directe créée avec succès ✅' if is_new else 'Conversation directe récupérée ✅',
                'conversation': conversation_data,
                'id': conversation.id,  # ✅ Inclure l'ID explicitement
                'is_new': is_new
            }, status=201 if is_new else 200)
        
        return Response(serializer.errors, status=400)

# 💬 Détails d'une conversation et ses messages
class ConversationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        # ✅ Correction : Utiliser la jointure avec ConversationParticipant
        conversation = get_object_or_404(
            Conversation.objects.filter(
                conversationparticipant__user=request.user
            ),
            id=conversation_id
        )
        
        # Marquer la conversation comme lue
        participant, created = ConversationParticipant.objects.get_or_create(
            conversation=conversation,
            user=request.user
        )
        participant.mark_as_read()
        
        # Récupérer les messages (pagination possible)
        messages = conversation.messages.filter(is_deleted=False)
        
        # Pagination optionnelle
        page_size = request.GET.get('page_size', 50)
        page = request.GET.get('page', 1)
        
        try:
            page_size = int(page_size)
            page = int(page)
            start = (page - 1) * page_size
            end = start + page_size
            messages = messages[start:end]
        except (ValueError, TypeError):
            messages = messages[:50]
        
        return Response({
            'message': 'Détails de la conversation récupérés avec succès ✅',
            'conversation': ConversationSerializer(
                conversation,
                context={'request': request}
            ).data,
            'messages': MessageSerializer(messages, many=True).data
        }, status=200)


# 📝 Envoyer un message dans une conversation
class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        # ✅ Correction : Utiliser la jointure avec ConversationParticipant
        conversation = get_object_or_404(
            Conversation.objects.filter(
                conversationparticipant__user=request.user
            ),
            id=conversation_id
        )
        
        serializer = CreateMessageSerializer(
            data=request.data,
            context={'request': request, 'conversation': conversation}
        )
        
        if serializer.is_valid():
            message = serializer.save()
            
            # Mettre à jour la date de dernière activité de la conversation
            conversation.updated_at = timezone.now()
            conversation.save()
            
            return Response({
                'message': 'Message envoyé avec succès ✅',
                'data': MessageSerializer(message).data
            }, status=201)
        
        return Response(serializer.errors, status=400)


# ✏️ Modifier un message
class EditMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, message_id):
        message = get_object_or_404(
            Message,
            id=message_id,
            sender=request.user,
            is_deleted=False
        )
        
        new_content = request.data.get('content', '').strip()
        if not new_content:
            return Response({
                'error': 'Le contenu du message ne peut pas être vide'
            }, status=400)
        
        message.edit_message(new_content)
        
        return Response({
            'message': 'Message modifié avec succès ✅',
            'data': MessageSerializer(message).data
        }, status=200)


# 🗑️ Supprimer un message
class DeleteMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, message_id):
        message = get_object_or_404(
            Message,
            id=message_id,
            sender=request.user,
            is_deleted=False
        )
        
        message.soft_delete()
        
        return Response({
            'message': 'Message supprimé avec succès ✅'
        }, status=200)


# 😊 Ajouter/Retirer une réaction à un message
class MessageReactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)
        reaction_type = request.data.get('reaction')
        
        if not reaction_type or reaction_type not in dict(MessageReaction.REACTION_CHOICES):
            return Response({
                'error': 'Type de réaction invalide'
            }, status=400)
        
        # ✅ Correction : Vérifier l'accès avec ConversationParticipant
        if not ConversationParticipant.objects.filter(
            conversation=message.conversation,
            user=request.user
        ).exists():
            return Response({
                'error': 'Accès non autorisé à ce message'
            }, status=403)
        
        reaction, created = MessageReaction.objects.get_or_create(
            message=message,
            user=request.user,
            reaction=reaction_type
        )
        
        if created:
            return Response({
                'message': 'Réaction ajoutée avec succès ✅',
                'reaction': MessageReactionSerializer(reaction).data
            }, status=201)
        else:
            return Response({
                'message': 'Réaction déjà existante'
            }, status=200)

    def delete(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)
        reaction_type = request.data.get('reaction')
        
        # ✅ Correction : Vérifier l'accès avec ConversationParticipant
        if not ConversationParticipant.objects.filter(
            conversation=message.conversation,
            user=request.user
        ).exists():
            return Response({
                'error': 'Accès non autorisé à ce message'
            }, status=403)
        
        try:
            reaction = MessageReaction.objects.get(
                message=message,
                user=request.user,
                reaction=reaction_type
            )
            reaction.delete()
            return Response({
                'message': 'Réaction supprimée avec succès ✅'
            }, status=200)
        except MessageReaction.DoesNotExist:
            return Response({
                'error': 'Réaction non trouvée'
            }, status=404)


# 👥 Ajouter un participant à une conversation
class AddParticipantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        # ✅ Correction : Utiliser la jointure avec ConversationParticipant
        conversation = get_object_or_404(
            Conversation.objects.filter(
                conversationparticipant__user=request.user
            ),
            id=conversation_id
        )
        
        # Vérifier si l'utilisateur est admin de la conversation
        participant = get_object_or_404(
            ConversationParticipant,
            conversation=conversation,
            user=request.user
        )
        
        if not participant.is_admin and conversation.type != 'DIRECT':
            return Response({
                'error': 'Seuls les administrateurs peuvent ajouter des participants'
            }, status=403)
        
        user_email = request.data.get('user_email')
        if not user_email:
            return Response({
                'error': 'Email utilisateur requis'
            }, status=400)
        
        try:
            new_user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return Response({
                'error': 'Utilisateur non trouvé'
            }, status=404)
        
        # Ajouter le participant
        new_participant, created = ConversationParticipant.objects.get_or_create(
            conversation=conversation,
            user=new_user
        )
        
        if created:
            return Response({
                'message': f'{new_user.name} ajouté à la conversation ✅'
            }, status=201)
        else:
            return Response({
                'message': 'Utilisateur déjà dans la conversation'
            }, status=200)


# 🚪 Quitter une conversation
class LeaveConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, conversation_id):
        # ✅ Correction : Utiliser la jointure avec ConversationParticipant
        conversation = get_object_or_404(
            Conversation.objects.filter(
                conversationparticipant__user=request.user
            ),
            id=conversation_id
        )
        
        try:
            participant = ConversationParticipant.objects.get(
                conversation=conversation,
                user=request.user
            )
            participant.delete()
            
            return Response({
                'message': 'Vous avez quitté la conversation ✅'
            }, status=200)
        except ConversationParticipant.DoesNotExist:
            return Response({
                'error': 'Vous n\'êtes pas participant de cette conversation'
            }, status=404)


# 📊 Statut utilisateur (en ligne, absent, etc.)
class UserStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_status, created = UserStatus.objects.get_or_create(
            user=request.user
        )
        return Response({
            'status': UserStatusSerializer(user_status).data
        }, status=200)

    def put(self, request):
        user_status, created = UserStatus.objects.get_or_create(
            user=request.user
        )
        
        serializer = UpdateUserStatusSerializer(
            user_status,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Statut mis à jour avec succès ✅',
                'status': serializer.data
            }, status=200)
        
        return Response(serializer.errors, status=400)


# 🔍 Rechercher des utilisateurs pour créer une conversation
class SearchUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        
        if len(query) < 2:
            return Response({
                'error': 'La recherche doit contenir au moins 2 caractères'
            }, status=400)
        
        users = User.objects.filter(
            Q(name__icontains=query) | Q(email__icontains=query)
        ).exclude(id=request.user.id)[:10]
        
        from accounts.serializers import UserSerializer
        return Response({
            'message': 'Recherche effectuée avec succès ✅',
            'users': UserSerializer(users, many=True).data
        }, status=200)


# 📈 Marquer une conversation comme lue
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_conversation_read(request, conversation_id):
    # ✅ Correction : Utiliser la jointure avec ConversationParticipant
    conversation = get_object_or_404(
        Conversation.objects.filter(
            conversationparticipant__user=request.user
        ),
        id=conversation_id
    )
    
    participant, created = ConversationParticipant.objects.get_or_create(
        conversation=conversation,
        user=request.user
    )
    participant.mark_as_read()
    
    return Response({
        'message': 'Conversation marquée comme lue ✅'
    }, status=200)