from django.db import models
import uuid
from django.contrib.auth import get_user_model
from userstory.models import UserStory
User = get_user_model()  # Utilisateur qui a signalé le blocage


class Blocage(models.Model):
    SEVERITY_CHOICES = [
        ('minor', 'Mineur'),
        ('moderate', 'Modéré'),
        ('critical', 'Critique'),
    ]

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('resolved', 'Résolu'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='moderate')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reported_at = models.DateTimeField(auto_now_add=True)
    task = models.ForeignKey(UserStory, on_delete=models.SET_NULL, null=True, blank=True, related_name='impediments')
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reported_impediments')

    def __str__(self):
        return f"{self.title} - {self.severity}"