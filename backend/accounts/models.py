from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager  

#On va creer un modele User personnalise qui herite de AbstractUser pour garder les fonctionnalites d'authentification de Django
class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('PO', 'Product Owner'),
        ('SM', 'Scrum Master'),
        ('DEV', 'Developer'),
        ('CLIENT', 'Client'),
    ]

    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
    ]

    username = None  # Suppression du champ username pour se baser uniquement sur l'email comme identifiant unique (django utilise username par defaut pour l'authentification)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    team = models.CharField(max_length=255, blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email' #On va utiliser l'email comme identifiant de connexion
    REQUIRED_FIELDS = []  # quand tu fais createsuperuser seul l'email et le mot de pass seront demandes.

    #Django utilisera UserManger pour creer des utilisateurs
    objects = UserManager()

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"
