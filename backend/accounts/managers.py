from django.contrib.auth.base_user import BaseUserManager

#une classe qui gere la creation des utilisateurs pour mon modele User qui herite de AbstractUser
class UserManager(BaseUserManager):
    use_in_migrations = True #Cela permet à Django d'utiliser ce manager lors des migrations
      
    #Creer un utilisateur standard  
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        if not extra_fields.get('name'):
            raise ValueError("Le nom est obligatoire")
        if not extra_fields.get('role'):
            raise ValueError("Le rôle est obligatoire")
        
        #Nettoyage de l'email, pour convertir [ar exemple TEST@DXC.COM => test@dxc.com
        email = self.normalize_email(email)
        #instancie un objet User avec l'email et les autres champs
        user = self.model(email=email, **extra_fields)

        #hashage du mot de passe
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('name', 'Admin')
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('status', 'active')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True.')

        return self.create_user(email, password, **extra_fields)
