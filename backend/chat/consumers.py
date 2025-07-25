# 🔄 WebSocket Consumer pour la messagerie en temps réel (OPTIONNEL)
# Ce fichier permet d'envoyer et recevoir des messages en temps réel

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from .models import Conversation, Message, ConversationParticipant
from .serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'chat_{self.conversation_id}'
        
        # Authentifier l'utilisateur via JWT token
        self.user = await self.get_user_from_token()
        
        if self.user and not isinstance(self.user, AnonymousUser):
            # Vérifier si l'utilisateur peut accéder à cette conversation
            can_access = await self.can_access_conversation()
            
            if can_access:
                # Rejoindre le groupe de conversation
                await self.channel_layer.group_add(
                    self.conversation_group_name,
                    self.channel_name
                )
                await self.accept()
                
                # Notifier que l'utilisateur est en ligne
                await self.update_user_status('ONLINE')
            else:
                await self.close(code=4003)  # Forbidden
        else:
            await self.close(code=4001)  # Unauthorized

    async def disconnect(self, close_code):
        if hasattr(self, 'conversation_group_name'):
            # Quitter le groupe de conversation
            await self.channel_layer.group_discard(
                self.conversation_group_name,
                self.channel_name
            )
            
            # Mettre à jour le statut utilisateur
            if self.user and not isinstance(self.user, AnonymousUser):
                await self.update_user_status('OFFLINE')

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'message')
            
            if message_type == 'message':
                await self.handle_message(text_data_json)
            elif message_type == 'typing':
                await self.handle_typing(text_data_json)
            elif message_type == 'read':
                await self.handle_read_receipt(text_data_json)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Format JSON invalide'
            }))

    async def handle_message(self, data):
        content = data.get('content', '').strip()
        if not content:
            return
            
        # Sauvegarder le message en base
        message = await self.save_message(content)
        
        if message:
            # Sérialiser le message
            message_data = await self.serialize_message(message)
            
            # Envoyer le message à tous les participants
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'chat_message',
                    'message': message_data
                }
            )

    async def handle_typing(self, data):
        is_typing = data.get('is_typing', False)
        
        # Diffuser l'indicateur de frappe
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'user_name': self.user.name,
                'is_typing': is_typing
            }
        )

    async def handle_read_receipt(self, data):
        # Marquer la conversation comme lue
        await self.mark_conversation_read()
        
        # Notifier les autres participants
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'read_receipt',
                'user_id': self.user.id,
                'user_name': self.user.name
            }
        )

    # Gestionnaires de messages WebSocket
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))

    async def typing_indicator(self, event):
        # Ne pas renvoyer ses propres indicateurs de frappe
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }))

    async def read_receipt(self, event):
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'read',
                'user_id': event['user_id'],
                'user_name': event['user_name']
            }))

    # Méthodes utilitaires
    @database_sync_to_async
    def get_user_from_token(self):
        try:
            # Récupérer le token depuis les headers ou query params
            token = None
            
            # Essayer de récupérer depuis les query params
            query_string = self.scope.get('query_string', b'').decode()
            if 'token=' in query_string:
                token = query_string.split('token=')[1].split('&')[0]
            
            if token:
                UntypedToken(token)
                from rest_framework_simplejwt.authentication import JWTAuthentication
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
                return user
                
        except (InvalidToken, TokenError, User.DoesNotExist):
            pass
        
        return AnonymousUser()

    @database_sync_to_async
    def can_access_conversation(self):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content
            )
            return message
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def serialize_message(self, message):
        serializer = MessageSerializer(message)
        return serializer.data

    @database_sync_to_async
    def mark_conversation_read(self):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            participant, created = ConversationParticipant.objects.get_or_create(
                conversation=conversation,
                user=self.user
            )
            participant.mark_as_read()
        except Conversation.DoesNotExist:
            pass

    @database_sync_to_async
    def update_user_status(self, status):
        from .models import UserStatus
        user_status, created = UserStatus.objects.get_or_create(user=self.user)
        user_status.status = status
        user_status.save()