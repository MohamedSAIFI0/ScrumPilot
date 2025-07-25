from django.contrib import admin
from .models import Conversation, Message, ConversationParticipant, MessageReaction, UserStatus


@admin.register(UserStatus)
class UserStatusAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'last_seen', 'custom_message']
    list_filter = ['status', 'last_seen']
    search_fields = ['user__name', 'user__email']
    readonly_fields = ['last_seen']


class ConversationParticipantInline(admin.TabularInline):
    model = ConversationParticipant
    extra = 0
    readonly_fields = ['joined_at', 'last_read_at']


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['created_at', 'updated_at', 'edited_at', 'deleted_at']
    fields = ['sender', 'content', 'message_type', 'is_edited', 'is_deleted', 'created_at']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'type', 'created_by', 'participant_count', 'created_at', 'updated_at']
    list_filter = ['type', 'created_at', 'team']
    search_fields = ['name', 'team', 'created_by__name']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ConversationParticipantInline, MessageInline]
    
    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'


class MessageReactionInline(admin.TabularInline):
    model = MessageReaction
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'conversation', 'content_preview', 'message_type', 'is_edited', 'is_deleted', 'created_at']
    list_filter = ['message_type', 'is_edited', 'is_deleted', 'created_at']
    search_fields = ['content', 'sender__name', 'sender__email']
    readonly_fields = ['created_at', 'updated_at', 'edited_at', 'deleted_at']
    inlines = [MessageReactionInline]
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenu'


@admin.register(ConversationParticipant)
class ConversationParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'conversation', 'is_admin', 'notifications_enabled', 'joined_at', 'last_read_at']
    list_filter = ['is_admin', 'notifications_enabled', 'joined_at']
    search_fields = ['user__name', 'user__email', 'conversation__name']
    readonly_fields = ['joined_at', 'last_read_at']


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'reaction', 'created_at']
    list_filter = ['reaction', 'created_at']
    search_fields = ['user__name', 'user__email']
    readonly_fields = ['created_at']