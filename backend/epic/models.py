from django.db import models
from projects.models import Project

class Epic(models.Model):
    """Modèle pour les Epics"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')  
    created_at = models.DateTimeField(auto_now_add=True)

    projet = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='epics')
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name