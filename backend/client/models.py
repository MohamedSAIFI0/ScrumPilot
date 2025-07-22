from django.db import models
from accounts.models import User

class Client(User):
    @property
    def active_projects_count(self):
        """Retourne le nombre de projets actifs du client"""
        return self.projects.filter(status='active').count()

    @property
    def total_feedbacks_count(self):
        """Retourne le nombre total de feedbacks donnés par le client"""
        return self.feedbacks.count()
    
    def get_recent_feedbacks(self, limit=5):
        """Retourne les feedbacks récents du client"""
        return self.feedbacks.order_by('-created_at')[:limit]
