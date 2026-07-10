#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Tự động nạp dữ liệu ban đầu
python seed_services.py
python seed_admin.py
