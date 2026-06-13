from apps.core.models import AuditEvent


def _state(obj):
    if obj is None:
        return {}
    if isinstance(obj, dict):
        return obj
    data = {}
    for field in getattr(obj, "_meta", []).fields:
        value = getattr(obj, field.name)
        data[field.name] = str(value) if value is not None else None
    return data


def record_event(actor, action, entity=None, prior_state=None, resulting_state=None, rejection_reason="", metadata=None):
    return AuditEvent.objects.create(
        actor=actor if getattr(actor, "is_authenticated", False) else None,
        actor_role=getattr(actor, "role", "") or "",
        action=action,
        entity_type=entity.__class__.__name__ if entity is not None else metadata.get("entity_type", "") if metadata else "",
        entity_id=str(getattr(entity, "pk", "")) if entity is not None else "",
        prior_state=_state(prior_state),
        resulting_state=_state(resulting_state if resulting_state is not None else entity),
        rejection_reason=rejection_reason,
        metadata=metadata or {},
    )


def record_rejection(actor, action, reason, metadata=None):
    return record_event(actor, action, rejection_reason=reason, metadata=metadata or {})
