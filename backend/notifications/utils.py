from accounts.models import User
from .models import Notification
import logging

logger = logging.getLogger(__name__)

def notify_developers(title, message, notification_type='info'):
    """Notifier tous les développeurs actifs"""
    try:
        developers = User.objects.filter(role='DEV', status='active')
        notifications_created = 0
        
        for dev in developers:
            notification = Notification.objects.create(
                receiver=dev,
                title=title,
                message=message,
                type=notification_type
            )
            notifications_created += 1
            logger.info(f"Notification created for developer {dev.username} (ID: {notification.id})")
        
        logger.info(f"Created {notifications_created} notifications for developers")
        return notifications_created
        
    except Exception as e:
        logger.error(f"Error in notify_developers: {e}")
        return 0

def notify_admins(title, message, notification_type='info'):
    """Notifier tous les admins actifs"""
    try:
        admins = User.objects.filter(role='ADMIN', status='active')
        notifications_created = 0
        
        for admin in admins:
            notification = Notification.objects.create(
                receiver=admin,
                title=title,
                message=message,
                type=notification_type
            )
            notifications_created += 1
            logger.info(f"Notification created for admin {admin.username} (ID: {notification.id})")
        
        logger.info(f"Created {notifications_created} notifications for admins")
        return notifications_created
        
    except Exception as e:
        logger.error(f"Error in notify_admins: {e}")
        return 0

def notify_product_owners(title, message, notification_type='info'):
    """Notifier tous les Product Owners actifs"""
    try:
        product_owners = User.objects.filter(role='PO', status='active')
        notifications_created = 0
        
        for po in product_owners:
            notification = Notification.objects.create(
                receiver=po,
                title=title,
                message=message,
                type=notification_type
            )
            notifications_created += 1
            logger.info(f"Notification created for PO {po.username} (ID: {notification.id})")
        
        logger.info(f"Created {notifications_created} notifications for product owners")
        return notifications_created
        
    except Exception as e:
        logger.error(f"Error in notify_product_owners: {e}")
        return 0

def notify_scrum_masters(title, message, notification_type='info'):
    """Notifier tous les Scrum Masters actifs"""
    try:
        scrum_masters = User.objects.filter(role='SM', status='active')
        notifications_created = 0
        
        for sm in scrum_masters:
            notification = Notification.objects.create(
                receiver=sm,
                title=title,
                message=message,
                type=notification_type
            )
            notifications_created += 1
            logger.info(f"Notification created for SM {sm.username} (ID: {notification.id})")
        
        logger.info(f"Created {notifications_created} notifications for scrum masters")
        return notifications_created
        
    except Exception as e:
        logger.error(f"Error in notify_scrum_masters: {e}")
        return 0


def notify_all_users(title, message, notification_type='info'):
    """Notifier tous les utilisateurs actifs"""
    try:
        users = User.objects.filter(status='active')
        notifications_created = 0
        
        for user in users:
            notification = Notification.objects.create(
                receiver=user,
                title=title,
                message=message,
                type=notification_type
            )
            notifications_created += 1
            logger.info(f"Notification created for user {user.username} (ID: {notification.id})")
        
        logger.info(f"Created {notifications_created} notifications for all users")
        return notifications_created
        
    except Exception as e:
        logger.error(f"Error in notify_all_users: {e}")
        return 0