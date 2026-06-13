from apps.core.audit import record_event
from apps.services.models import ServicePriceHistory


def update_service_catalog(actor, service, **changes):
    prior_price = service.base_price
    prior_duration = service.duration_minutes
    reason = changes.pop("reason", "")
    for key, value in changes.items():
        setattr(service, key, value)
    service.save()
    if prior_price != service.base_price or prior_duration != service.duration_minutes:
        ServicePriceHistory.objects.create(
            service=service,
            old_price=prior_price,
            new_price=service.base_price,
            old_duration=prior_duration,
            new_duration=service.duration_minutes,
            changed_by=actor,
            reason=reason,
        )
    record_event(actor, "service.update", service, prior_state={"base_price": str(prior_price), "duration_minutes": prior_duration})
    return service
