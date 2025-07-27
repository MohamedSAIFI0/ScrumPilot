from django.db import models
import uuid
from sprints.models import Sprint
from accounts.models import User

class Retrospective(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='retrospectives')
    what_worked = models.TextField()
    what_didnt_work = models.TextField()
    improvements = models.TextField()
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='retrospectives')
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_locked = models.BooleanField(default=False)