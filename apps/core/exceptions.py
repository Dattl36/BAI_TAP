from rest_framework.exceptions import APIException


class ErrorCodes:
    PERMISSION_DENIED = "permission_denied"
    APPOINTMENT_CONFLICT = "appointment_conflict"
    INVALID_STATUS_TRANSITION = "invalid_status_transition"
    INACTIVE_SERVICE = "inactive_service"
    VOUCHER_NOT_ELIGIBLE = "voucher_not_eligible"
    INSUFFICIENT_REWARD_POINTS = "insufficient_reward_points"
    PAYMENT_STATE_ERROR = "payment_state_error"
    COMPLAINT_ASSIGNMENT_ERROR = "complaint_assignment_error"
    VALIDATION_ERROR = "validation_error"


class BusinessError(APIException):
    status_code = 400
    default_code = ErrorCodes.VALIDATION_ERROR
    default_detail = "The requested operation is not valid."

    def __init__(self, message=None, code=None, details=None, status_code=None):
        if status_code is not None:
            self.status_code = status_code
        self.details = details or {}
        super().__init__(detail=message or self.default_detail, code=code or self.default_code)
