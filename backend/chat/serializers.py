from rest_framework import serializers
from .models import Conversation, Message, ConversationParticipant, MessageReaction, UserStatus
from accounts.models import User
from accounts.serializers import UserSerializer


class UserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStatus
        fields = ['status', 'last_seen', 'custom_message', 'is_online']


class UserWithStatusSerializer(serializers.ModelSerializer):
    chat_status = UserStatusSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'avatar', 'chat_status']


class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = MessageReaction
        fields = ['id', 'reaction', 'user', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    reactions = MessageReactionSerializer(many=True, read_only=True)
    createdAt = serializers.SerializerMethodField()
    updatedAt = serializers.SerializerMethodField()
    editedAt = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'content', 'message_type', 'file_url', 'file_name',
            'sender', 'reactions', 'is_edited', 'is_deleted',
            'createdAt', 'updatedAt', 'editedAt'
        ]
        read_only_fields = ['sender', 'is_edited', 'is_deleted']

    def get_createdAt(self, obj):
        return obj.created_at.isoformat() if obj.created_at else None
    
    def get_updatedAt(self, obj):
        return obj.updated_at.isoformat() if obj.updated_at else None
    
    def get_editedAt(self, obj):
        return obj.edited_at.isoformat() if obj.edited_at else None


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content', 'message_type', 'file_url', 'file_name']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        validated_data['conversation'] = self.context['conversation']
        return super().create(validated_data)


class ConversationParticipantSerializer(serializers.ModelSerializer):
    user = UserWithStatusSerializer(read_only=True)
    joinedAt = serializers.SerializerMethodField()
    lastReadAt = serializers.SerializerMethodField()
    
    class Meta:
        model = ConversationParticipant
        fields = ['user', 'is_admin', 'notifications_enabled', 'joinedAt', 'lastReadAt']

    def get_joinedAt(self, obj):
        return obj.joined_at.isoformat() if obj.joined_at else None
    
    def get_lastReadAt(self, obj):
        return obj.last_read_at.isoformat() if obj.last_read_at else None


class ConversationSerializer(serializers.ModelSerializer):
    participants = ConversationParticipantSerializer(
        source='conversationparticipant_set', 
        many=True, 
        read_only=True
    )
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    createdAt = serializers.SerializerMethodField()
    updatedAt = serializers.SerializerMethodField()
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'name', 'type', 'team', 'participants', 
            'last_message', 'unread_count', 'created_by',
            'createdAt', 'updatedAt'
        ]
        read_only_fields = ['created_by']

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_unread_count_for_user(request.user)
        return 0

    def get_createdAt(self, obj):
        return obj.created_at.isoformat() if obj.created_at else None
    
    def get_updatedAt(self, obj):
        return obj.updated_at.isoformat() if obj.updated_at else None


class CreateConversationSerializer(serializers.ModelSerializer):
    participant_emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Conversation
        fields = ['name', 'type', 'team', 'participant_emails']

    def create(self, validated_data):
        participant_emails = validated_data.pop('participant_emails', [])
        conversation = Conversation.objects.create(
            created_by=self.context['request'].user,
            **validated_data
        )
        
        # Ajouter le créateur comme participant et admin
        ConversationParticipant.objects.create(
            conversation=conversation,
            user=self.context['request'].user,
            is_admin=True
        )
        
        # Ajouter les autres participants
        for email in participant_emails:
            try:
                user = User.objects.get(email=email)
                ConversationParticipant.objects.get_or_create(
                    conversation=conversation,
                    user=user
                )
            except User.DoesNotExist:
                continue
                
        return conversation

class CreateDirectConversationSerializer(serializers.Serializer):
    recipient_email = serializers.EmailField()

    def create(self, validated_data):
        recipient_email = validated_data['recipient_email']
        current_user = self.context['request'].user
        
        try:
            recipient = User.objects.get(email=recipient_email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Utilisateur destinataire introuvable")
        
        if recipient == current_user:
            raise serializers.ValidationError("Vous ne pouvez pas créer une conversation avec vous-même")
        
        # Vérifier si une conversation directe existe déjà
        existing_conversation = Conversation.objects.filter(
            type='DIRECT',
            participants=current_user
        ).filter(participants=recipient).first()
        
        if existing_conversation:
            # ✅ Marquer que c'est une conversation existante
            self._existing_conversation = True
            return existing_conversation
        
        # Créer une nouvelle conversation directe
        conversation = Conversation.objects.create(
            type='DIRECT',
            created_by=current_user
        )
        
        # Ajouter les deux participants
        ConversationParticipant.objects.create(
            conversation=conversation,
            user=current_user
        )
        ConversationParticipant.objects.create(
            conversation=conversation,
            user=recipient
        )
        
        # ✅ Marquer que c'est une nouvelle conversation
        self._existing_conversation = False
        return conversation
    
    
class UpdateUserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStatus
        fields = ['status', 'custom_message']