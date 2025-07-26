from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer
from notifications.utils import notify_developers, notify_product_owners, notify_scrum_masters, notify_admins
from accounts.models import User
from notifications.models import Notification
import logging

logger = logging.getLogger(__name__)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        try:
            project = serializer.save()
            logger.info(f"Project created: {project.name}")
            print(f"✅ Project created: {project.name}")
            
            # Compter les notifications avant
            notifications_before = Notification.objects.count()
            print(f"📊 Notifications before: {notifications_before}")
            
            # Vérifier et afficher les utilisateurs de chaque rôle
            self._log_users_by_role()
            
            # Créer les notifications avec gestion d'erreurs et comptage
            total_created = 0
            
            # Notifier les développeurs
            dev_count = notify_developers(
                title="🚀 Nouveau Projet Créé",
                message=f"Un nouveau projet '{project.name}' a été créé et nécessite votre attention.",
                notification_type='success'
            )
            total_created += dev_count
            print(f"✅ Notifications créées pour les développeurs: {dev_count}")

            # Notifier les Product Owners
            po_count = notify_product_owners(
                title="🚀 Nouveau Projet Créé", 
                message=f"Un nouveau projet '{project.name}' a été créé.",
                notification_type='info'
            )
            total_created += po_count
            print(f"✅ Notifications créées pour les PO: {po_count}")

            # Notifier les Scrum Masters
            sm_count = notify_scrum_masters(
                title="🚀 Nouveau Projet Créé",
                message=f"Un nouveau projet '{project.name}' a été créé.",
                notification_type='info'
            )
            total_created += sm_count
            print(f"✅ Notifications créées pour les SM: {sm_count}")

            # Notifier les admins
            admin_count = notify_admins(
                title="🚀 Nouveau Projet Créé",
                message=f"Un nouveau projet '{project.name}' a été créé dans le système.",
                notification_type='warning'
            )
            total_created += admin_count
            print(f"✅ Notifications créées pour les admins: {admin_count}")
            
            # Vérifications finales
            notifications_after = Notification.objects.count()
            new_notifications = notifications_after - notifications_before
            
            print(f"📊 Notifications after: {notifications_after}")
            print(f"📊 New notifications created: {new_notifications}")
            print(f"📊 Expected notifications: {total_created}")
            
            if new_notifications == total_created:
                print("✅ SUCCESS: All notifications created successfully!")
                logger.info(f"Successfully created {total_created} notifications for project {project.name}")
            else:
                print(f"⚠️  WARNING: Expected {total_created} but created {new_notifications}")
                logger.warning(f"Notification count mismatch for project {project.name}: expected {total_created}, got {new_notifications}")
            
            # Vérifier les notifications spécifiques au projet
            project_notifications = Notification.objects.filter(
                title="🚀 Nouveau Projet Créé",
                message__contains=project.name
            )
            print(f"📋 Project-specific notifications found: {project_notifications.count()}")
            
            for notif in project_notifications:
                print(f"   📬 Notification for {notif.receiver.username} ({notif.receiver.role}): {notif.title}")
                
        except Exception as e:
            logger.error(f"Error in perform_create: {e}")
            print(f"❌ ERROR in perform_create: {e}")
            raise

    def _log_users_by_role(self):
        """Log des utilisateurs par rôle pour debug"""
        roles = ['DEV', 'PO', 'SM', 'ADMIN', 'CLIENT']
        
        print("\n👥 UTILISATEURS PAR RÔLE:")
        for role in roles:
            active_users = User.objects.filter(role=role, status='ACTIVE')
            total_users = User.objects.filter(role=role)
            print(f"   {role}: {active_users.count()} actifs / {total_users.count()} total")
            
            for user in active_users:
                print(f"     - {user.username} (ID: {user.id}, Status: {user.status})")

    def create(self, request, *args, **kwargs):
        """Override create pour une meilleure gestion des erreurs"""
        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f"Project creation API call successful")
            return response
        except Exception as e:
            logger.error(f"Error in project creation API: {e}")
            return Response(
                {"error": "Erreur lors de la création du projet"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )