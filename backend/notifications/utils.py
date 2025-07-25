from accounts.models import User
from .models import Notification

def notify_developers(title, message):
    developers = User.objects.filter(role='DEV', status='ACTIVE')
    for dev in developers:
        Notification.objects.create(
            receiver=dev,
            title=title,
            message=message
        )

def notify_admins(title, message):
    admins = User.objects.filter(role='ADMIN', status='ACTIVE')
    for admin in admins:
        Notification.objects.create(
            receiver=admin,
            title=title,
            message=message
        )
def notify_product_owners(title, message):
    product_owners = User.objects.filter(role='PO', status='ACTIVE')
    for po in product_owners:
        Notification.objects.create(
            receiver=po,
            title=title,
            message=message
        )


def notify_scrum_masters(title, message):
    scrum_masters = User.objects.filter(role='SM', status='ACTIVE')
    for sm in scrum_masters:
        Notification.objects.create(
            receiver=sm,
            title=title,
            message=message
        )

def notify_clients(title, message):
    clients = User.objects.filter(role='CLIENT', status='ACTIVE')
    for client in clients:
        Notification.objects.create(
            receiver=client,
            title=title,
            message=message
        )

def notify_all_users(title, message):
    users = User.objects.filter(status='ACTIVE')
    for user in users:
        Notification.objects.create(
            receiver=user,
            title=title,
            message=message
        )
