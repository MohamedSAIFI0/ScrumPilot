from django.db import models
from accounts.models import User
from client.models import Client

class Project(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'Haute priorité'),
        ('medium', 'Priorité moyenne'),
        ('low', 'Faible priorité'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    team = models.CharField(max_length=100)
    members = models.PositiveIntegerField(default=1)
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    objectives = models.JSONField(default=list)  # Store objectives as a list
    technologies = models.JSONField(default=list)  # Store technologies as a list
    risks = models.JSONField(default=list)  # Store risks as a list
    status = models.CharField(max_length=50, default='Planification')
    progress = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=100)
    
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='projects',
        verbose_name="Client"
    )

    product_owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_projects',
        verbose_name="Product Owner"
    )    
    
    scrum_master = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_projects',
        verbose_name="Scrum Master"
    )
    class Meta:
        verbose_name = "Projet"
        verbose_name_plural = "Projets"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.client.name}"

  

