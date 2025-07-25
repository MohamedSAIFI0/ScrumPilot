from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from accounts.models import User
from .models import UserStatus, Message, Conversation


@receiver(post_save, sender=User)
def create_user_status(sender, instance, created, **kwargs):
    """Créer automatiquement un statut pour chaque nouvel utilisateur"""
    if created:
        UserStatus.objects.create(user=instance)


@receiver(post_save, sender=Message)
def update_conversation_timestamp(sender, instance, created, **kwargs):
    """Mettre à jour le timestamp de la conversation quand un nouveau message est envoyé"""
    if created:
        conversation = instance.conversation
        conversation.save()  # Cela mettra à jour le champ updated_at automatiquement


@receiver(post_delete, sender=Message)
def cleanup_empty_conversations(sender, instance, **kwargs):
    """Optionnel: Supprimer les conversations vides après suppression du dernier message"""
    conversation = instance.conversation
    if not conversation.messages.exists() and conversation.type == 'DIRECT':
        # Ne supprimer automatiquement que les conversations directes vides
        # Les groupes peuvent être conservés même sans messages
        pass  # Vous pouvez décommenter la ligne suivante si vous voulez cette fonctionnalité
        # conversation.delete()