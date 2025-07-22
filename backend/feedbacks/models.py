from django.db import models
import uuid
from django.utils import timezone
from client.models import Client
from userstory.models import UserStory

class Feedbacks(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    content = models.TextField(default='general')
    rating = models.IntegerField(null=True, blank=True)
    deliverable_id = models.CharField(max_length=255, null=True, blank=True)

    category = models.CharField(max_length=50, default='general', choices=[
        ('general', 'Feedback général'),
        ('ui-ux', 'Interface utilisateur'),
        ('functionality', 'Fonctionnalité'),
        ('performance', 'Performance'),
        ('bug', 'Problème technique'),
        ('suggestion', 'Suggestion d\'amélioration'),
    ])

    priority = models.CharField(max_length=10, default='medium', choices=[
        ('low', 'Faible'),
        ('medium', 'Moyenne'),
        ('high', 'Élevée'),
    ])

    created_at = models.DateTimeField(default=timezone.now, editable=False)

    #relations 

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='feedbacks',
        verbose_name='Client'
    )

    userstory = models.ForeignKey(
        UserStory,
        on_delete=models.CASCADE,
        related_name="feedbacks"
    )

