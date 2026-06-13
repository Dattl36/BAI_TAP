from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def success(data=None, message="Success", status=200):
    return Response({"data": data if data is not None else {}, "message": message}, status=status)


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        return response
    code = getattr(exc, "default_code", None) or getattr(exc, "code", "error")
    details = getattr(exc, "details", None) or response.data
    message = response.data.get("detail", response.data) if isinstance(response.data, dict) else response.data
    response.data = {
        "error": {
            "code": str(code),
            "message": str(message),
            "details": details,
        }
    }
    return response
