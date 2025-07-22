from django.db import models
import uuid
from projects.models import Project
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db import models
from accounts.models import User
from django.core.validators import MinValueValidator, MaxValueValidator



# Create your models here.
class Sprint(models.Model):
    """Modèle pour les sprints"""
    
    STATUS_CHOICES = [
        ('planned', 'Planifié'),
        ('active', 'Actif'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ]
    
    DURATION_CHOICES = [
        (7, '1 semaine (7 jours)'),
        (14, '2 semaines (14 jours)'),
        (21, '3 semaines (21 jours)'),
        (28, '4 semaines (28 jours)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name="Nom du sprint")
    goal = models.TextField(verbose_name="Objectif du sprint")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned', verbose_name="Statut")
    
    # Relations
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sprints', verbose_name="Projet")
    
    # Dates et durée
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(verbose_name="Date de fin")
    duration = models.PositiveIntegerField(choices=DURATION_CHOICES, default=14, verbose_name="Durée (jours)")
    
    # Capacité et points
    capacity = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        verbose_name="Capacité (story points)"
    )
    
    # Cérémonies Scrum
    planning_ceremony = models.BooleanField(default=True, verbose_name="Sprint Planning")
    daily_ceremony = models.BooleanField(default=True, verbose_name="Daily Scrum")
    review_ceremony = models.BooleanField(default=True, verbose_name="Sprint Review")
    retrospective_ceremony = models.BooleanField(default=True, verbose_name="Rétrospective")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sprints', verbose_name="Créé par")
    
    class Meta:
        verbose_name = "Sprint"
        verbose_name_plural = "Sprints"
        ordering = ['-start_date']
        unique_together = ['project', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.project.code}"
    
    
    def clean(self):  
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("La date de fin doit être postérieure à la date de début")
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def is_completed(self):
        return self.status == 'completed'
    
    @property
    def progress_percentage(self):
        if self.total_points == 0:
            return 0
        return round((self.completed_points / self.total_points) * 100)
    
    @property
    def total_stories(self):
        return self.stories.count()
    
    @property
    def completed_stories(self):
        return self.stories.filter(status='done').count()
    
    @property
    def total_points(self):
        return self.stories.aggregate(total=models.Sum('points'))['total'] or 0
    
    @property
    def completed_points(self):
        return self.stories.filter(status='done').aggregate(
            total=models.Sum('points')
        )['total'] or 0
    
    @property
    def remaining_points(self):
        return self.total_points - self.completed_points
    
    @property
    def days_remaining(self):
        if self.end_date:
            delta = self.end_date - timezone.now().date()
            return delta.days if delta.days > 0 else 0
        return 0
    
    @property
    def capacity_utilization(self):
        if self.capacity == 0:
            return 0
        return round((self.total_points / self.capacity) * 100)