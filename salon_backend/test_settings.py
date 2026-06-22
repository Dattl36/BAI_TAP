import os


os.environ.setdefault("DEBUG", "true")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

from .settings import *  # noqa: F403
