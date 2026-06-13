def customer_history(customer):
    return {
        "appointments": list(customer.appointments.values("id", "scheduled_start", "scheduled_end", "status")),
        "invoices": list(customer.invoices.values("id", "status", "total_due", "paid_amount", "balance_due")),
        "payments": list(customer.payments.values("id", "amount", "method", "status")),
        "feedback": list(customer.feedback.values("id", "status", "message")),
        "complaints": list(customer.complaints.values("id", "status", "title")),
        "rewards": list(customer.reward_ledger.values("id", "movement_type", "points", "balance_after")),
        "notifications": list(customer.user.notifications.values("id", "category", "title", "delivery_status", "read_at")),
    }
