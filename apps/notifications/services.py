from django.utils import timezone

from apps.notifications.models import Notification


def notify_user(user, category, title, message, related=None):
    return Notification.objects.create(
        recipient=user,
        category=category,
        title=title,
        message=message,
        related_object_type=related.__class__.__name__ if related else "",
        related_object_id=str(getattr(related, "pk", "")) if related else "",
        delivery_status="delivered",
    )


def mark_read(notification):
    notification.delivery_status = "read"
    notification.read_at = timezone.now()
    notification.save(update_fields=["delivery_status", "read_at", "updated_at"])
    return notification
