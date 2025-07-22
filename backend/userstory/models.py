from django.db import models
from accounts.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from sprints.models import Sprint
from epic.models import Epic

# Create your models here.
class UserStory(models.Model):
    """Modèle principal pour les User Stories"""
    
    PRIORITY_CHOICES = [
        ('high', 'Haute priorité'),
        ('medium', 'Priorité moyenne'),
        ('low', 'Faible priorité'),
    ]
    
    STATUS_CHOICES = [
        ('ready', 'Prêt'),
        ('in_progress', 'En cours'),
        ('in_review', 'En révision'),
        ('testing', 'Test'),
        ('done', 'Terminé'),
        ('blocked', 'Bloqué'),
    ]
    
    STORY_POINTS_CHOICES = [
        (1, '1 point'),
        (2, '2 points'),
        (3, '3 points'),
        (5, '5 points'),
        (8, '8 points'),
        (13, '13 points'),
        (21, '21 points'),
    ]
    
    # Champs principaux
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium'
    )
    points = models.IntegerField(
        choices=STORY_POINTS_CHOICES,
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(21)]
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='ready'
    )
    
    # Relations
    epic = models.ForeignKey(
        Epic, 
        on_delete=models.CASCADE, 
        related_name='userstories'
    )
    sprint = models.ForeignKey(
        Sprint, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='userstories'
    )
    assignee = models.ManyToManyField(
        User, 
    )
    
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User Story'
        verbose_name_plural = 'User Stories'
    
    def __str__(self):
        return self.title
    
    @property
    def priority_display_class(self):
        """Retourne la classe CSS pour la priorité"""
        priority_classes = {
            'high': 'text-red-600',
            'medium': 'text-yellow-600',
            'low': 'text-green-600'
        }
        return priority_classes.get(self.priority, 'text-gray-600')
    
    @property
    def status_display_class(self):
        """Retourne la classe CSS pour le statut"""
        status_classes = {
            'ready': 'bg-blue-100 text-blue-800',
            'in_progress': 'bg-yellow-100 text-yellow-800',
            'in_review': 'bg-purple-100 text-purple-800',
            'testing': 'bg-orange-100 text-orange-800',
            'done': 'bg-green-100 text-green-800',
            'blocked': 'bg-red-100 text-red-800',
        }
        return status_classes.get(self.status, 'bg-gray-100 text-gray-800')