from django.db import models
from accounts.models import User

# Create your models here.

class Profil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    telephone = models.CharField(max_length=50)
    biographie = models.TextField()
    photo = models.ImageField(upload_to=r'C:\Users\P15\Desktop\backend_dxc\backend\profil\photos', null=True, blank=True)

    def __str__(self):
        return f"Profile de {self.user.name}"

 