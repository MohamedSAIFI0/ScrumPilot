from rest_framework import viewsets
from .models import Sprint
from .serializers import SprintSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from notifications.utils import notify_developers, notify_product_owners, notify_scrum_masters, notify_admins
from accounts.models import User
from notifications.models import Notification
import logging

logger = logging.getLogger(__name__)

class SprintViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer

    def perform_create(self, serializer):
        try:
            sprint = serializer.save(created_by=self.request.user)
            logger.info(f"Sprint créé: {sprint.name}")
            print(f"✅ Sprint créé: {sprint.name}")
            
            # Compter les notifications avant
            notifications_before = Notification.objects.count()
            print(f"📊 Notifications avant: {notifications_before}")
            
            # Vérifier et afficher les utilisateurs de chaque rôle
            self._log_users_by_role()
            
            # Créer les notifications avec gestion d'erreurs et comptage
            total_created = 0
            
            # Notifier les développeurs
            dev_count = notify_developers(
                title="🚀 Nouveau Sprint Créé",
                message=f"Un nouveau sprint '{sprint.name}' a été créé et nécessite votre attention.",
                notification_type='success'
            )
            total_created += dev_count
            print(f"✅ Notifications créées pour les développeurs: {dev_count}")

            # Notifier les Product Owners
            po_count = notify_product_owners(
                title="🚀 Nouveau Sprint Créé", 
                message=f"Un nouveau sprint '{sprint.name}' a été créé.",
                notification_type='info'
            )
            total_created += po_count
            print(f"✅ Notifications créées pour les PO: {po_count}")

            # Notifier les Scrum Masters
            sm_count = notify_scrum_masters(
                title="🚀 Nouveau Sprint Créé",
                message=f"Un nouveau sprint '{sprint.name}' a été créé.",
                notification_type='info'
            )
            total_created += sm_count
            print(f"✅ Notifications créées pour les SM: {sm_count}")

            # Notifier les admins
            admin_count = notify_admins(
                title="🚀 Nouveau Sprint Créé",
                message=f"Un nouveau sprint '{sprint.name}' a été ajouté au système.",
                notification_type='warning'
            )
            total_created += admin_count
            print(f"✅ Notifications créées pour les admins: {admin_count}")
            
            # Vérifications finales
            notifications_after = Notification.objects.count()
            new_notifications = notifications_after - notifications_before
            
            print(f"📊 Notifications après: {notifications_after}")
            print(f"📊 Nouvelles notifications créées: {new_notifications}")
            print(f"📊 Notifications attendues: {total_created}")
            
            if new_notifications == total_created:
                print("✅ SUCCESS: Toutes les notifications ont été créées avec succès !")
                logger.info(f"Création réussie de {total_created} notifications pour le sprint {sprint.name}")
            else:
                print(f"⚠️  WARNING: Attendu {total_created} mais créé {new_notifications}")
                logger.warning(f"Écart dans le nombre de notifications pour le sprint {sprint.name}: attendu {total_created}, obtenu {new_notifications}")
            
            # Vérifier les notifications spécifiques au sprint
            sprint_notifications = Notification.objects.filter(
                title="🚀 Nouveau Sprint Créé",
                message__contains=sprint.name
            )
            print(f"📋 Notifications spécifiques au sprint trouvées: {sprint_notifications.count()}")
            
            for notif in sprint_notifications:
                print(f"   📬 Notification pour {notif.receiver.username} ({notif.receiver.role}): {notif.title}")
                
        except Exception as e:
            logger.error(f"Erreur dans perform_create: {e}")
            print(f"❌ ERREUR dans perform_create: {e}")
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
            logger.info(f"Appel API création sprint réussi")
            return response
        except Exception as e:
            logger.error(f"Erreur dans l'API de création de sprint: {e}")
            return Response(
                {"error": "Erreur lors de la création du sprint"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )