from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Epic
from .serializers import EpicSerializer
from notifications.utils import notify_scrum_masters, notify_product_owners, notify_developers, notify_admins
from accounts.models import User
from notifications.models import Notification
import logging

logger = logging.getLogger(__name__)

class EpicViewSet(viewsets.ModelViewSet):
    queryset = Epic.objects.all()
    serializer_class = EpicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['projet']

    def perform_create(self, serializer):
        try:
            epic = serializer.save()
            logger.info(f"🎯 Epic créé: {epic.name}")
            print(f"✅ Epic créé: {epic.name}")

            notifications_before = Notification.objects.count()
            print(f"📊 Notifications avant: {notifications_before}")

            self._log_users_by_role()

            total_created = 0

            # Notifier développeurs
            dev_count = notify_developers(
                title="🧩 Nouvelle Epic Créée",
                message=f"Une nouvelle epic '{epic.name}' a été ajoutée au projet.",
                notification_type='info'
            )
            total_created += dev_count
            print(f"✅ Notifications créées pour les DEV: {dev_count}")

            # Notifier PO
            po_count = notify_product_owners(
                title="🧩 Nouvelle Epic Créée",
                message=f"Une nouvelle epic '{epic.name}' a été ajoutée.",
                notification_type='success'
            )
            total_created += po_count
            print(f"✅ Notifications créées pour les PO: {po_count}")

            # Notifier SM
            sm_count = notify_scrum_masters(
                title="🧩 Nouvelle Epic Créée",
                message=f"Une nouvelle epic '{epic.name}' a été ajoutée.",
                notification_type='info'
            )
            total_created += sm_count
            print(f"✅ Notifications créées pour les SM: {sm_count}")

            # Notifier Admins
            admin_count = notify_admins(
                title="🧩 Nouvelle Epic Créée",
                message=f"L'epic '{epic.name}' vient d'être enregistrée dans le système.",
                notification_type='warning'
            )
            total_created += admin_count
            print(f"✅ Notifications créées pour les Admins: {admin_count}")

            notifications_after = Notification.objects.count()
            new_notifications = notifications_after - notifications_before

            print(f"📊 Notifications après: {notifications_after}")
            print(f"📊 Notifications créées: {new_notifications}")
            print(f"📊 Notifications attendues: {total_created}")

            if new_notifications == total_created:
                print("✅ SUCCESS: Toutes les notifications ont été créées avec succès.")
                logger.info(f"{total_created} notifications créées pour l'epic {epic.name}")
            else:
                print("⚠️ Mismatch entre attendues et créées.")
                logger.warning(f"Notifications mismatch pour {epic.name} (attendues: {total_created}, créées: {new_notifications})")

            epic_notifications = Notification.objects.filter(
                title="🧩 Nouvelle Epic Créée",
                message__contains=epic.name
            )
            print(f"📋 Notifications spécifiques trouvées: {epic_notifications.count()}")

            for notif in epic_notifications:
                print(f"   📬 Pour {notif.receiver.username} ({notif.receiver.role})")

        except Exception as e:
            logger.error(f"❌ Erreur dans perform_create (Epic): {e}")
            print(f"❌ ERREUR: {e}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            logger.info("✅ API Epic creation réussie")
            return response
        except Exception as e:
            logger.error(f"❌ Erreur dans l'API de création d'epic: {e}")
            return Response(
                {"error": "Erreur lors de la création de l'epic."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _log_users_by_role(self):
        roles = ['DEV', 'PO', 'SM', 'ADMIN']
        print("\n👥 UTILISATEURS PAR RÔLE:")
        for role in roles:
            active_users = User.objects.filter(role=role, status='ACTIVE')
            total_users = User.objects.filter(role=role)
            print(f"   {role}: {active_users.count()} actifs / {total_users.count()} total")
            for user in active_users:
                print(f"     - {user.username} (ID: {user.id}, Status: {user.status})")
