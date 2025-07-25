from django.db import models
from django.conf import settings
from django.utils import timezone


class Conversation(models.Model):
    CONVERSATION_TYPES = [
        ('DIRECT', 'Message direct'),
        ('GROUP', 'Groupe'),
        ('TEAM', 'Équipe'),
    ]

    name = models.CharField(max_length=255, blank=True, null=True)  # Pour les groupes
    type = models.CharField(max_length=10, choices=CONVERSATION_TYPES, default='DIRECT')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_conversations'
    )
    
    # Pour les conversations d'équipe
    team = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        if self.type == 'DIRECT':
            participants_names = [p.name for p in self.participants.all()[:2]]
            return f"Direct: {' & '.join(participants_names)}"
        elif self.type == 'TEAM':
            return f"Équipe: {self.team}"
        else:
            return self.name or f"Groupe #{self.id}"

    @property
    def last_message(self):
        return self.messages.last()

    def get_unread_count_for_user(self, user):
        """Retourne le nombre de messages non lus pour un utilisateur"""
        last_read = ConversationParticipant.objects.filter(
            conversation=self, 
            user=user
        ).first()
        
        if not last_read or not last_read.last_read_at:
            return self.messages.count()
        
        return self.messages.filter(
            created_at__gt=last_read.last_read_at
        ).exclude(sender=user).count()


class Message(models.Model):
    MESSAGE_TYPES = [
        ('TEXT', 'Texte'),
        ('IMAGE', 'Image'),
        ('FILE', 'Fichier'),
        ('SYSTEM', 'Message système'),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='TEXT')
    file_url = models.URLField(blank=True, null=True)  # Pour les fichiers/images
    file_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Pour la modification des messages
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    
    # Pour la suppression logique
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.name}: {self.content[:50]}..."

    def soft_delete(self):
        """Suppression logique du message"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.content = "Ce message a été supprimé"
        self.save()

    def edit_message(self, new_content):
        """Modification du message"""
        self.content = new_content
        self.is_edited = True
        self.edited_at = timezone.now()
        self.save()


class ConversationParticipant(models.Model):
    """Table intermédiaire pour gérer les participants et leurs statuts"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(null=True, blank=True)
    is_admin = models.BooleanField(default=False)  # Pour les groupes
    notifications_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ['conversation', 'user']

    def mark_as_read(self):
        """Marquer la conversation comme lue"""
        self.last_read_at = timezone.now()
        self.save()


class MessageReaction(models.Model):
    """Réactions aux messages (emojis)"""
    REACTION_CHOICES = [
        ('👍', 'Pouce levé'),
        ('❤️', 'Cœur'),
        ('😂', 'Rire'),
        ('😮', 'Surpris'),
        ('😢', 'Triste'),
        ('😡', 'Colère'),
    ]

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['message', 'user', 'reaction']

    def __str__(self):
        return f"{self.user.name} {self.reaction} sur message #{self.message.id}"


class UserStatus(models.Model):
    """Statut en ligne des utilisateurs"""
    STATUS_CHOICES = [
        ('ONLINE', 'En ligne'),
        ('AWAY', 'Absent'),
        ('BUSY', 'Occupé'),
        ('OFFLINE', 'Hors ligne'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_status')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OFFLINE')
    last_seen = models.DateTimeField(auto_now=True)
    custom_message = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.name} - {self.status}"

    @property
    def is_online(self):
        return self.status == 'ONLINE'