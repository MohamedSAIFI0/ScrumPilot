# contact/models.py

from django.db import models

class Contact(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    company = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    service_type = models.CharField(max_length=50, choices=[
        ('consultation', 'Consultation gratuite'),
        ('demo', 'Démonstration produit'),
        ('formation', 'Formation équipe'),
        ('audit', 'Audit processus'),
        ('integration', 'Intégration système'),
    ])

    def __str__(self):
        return f"{self.first_name} {self.last_name}"