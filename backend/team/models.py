import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    
    members = models.ManyToManyField(User, related_name='teams')
    scrum_master = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='scrum_master_teams'
    )
    product_owner = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='product_owner_teams'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
