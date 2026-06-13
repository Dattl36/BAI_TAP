from django.contrib import admin

from apps.core.models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("action", "entity_type", "entity_id", "actor", "actor_role", "created_at")
    list_filter = ("actor_role", "action", "entity_type")
    search_fields = ("action", "entity_type", "entity_id", "actor__username")
