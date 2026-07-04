#!/bin/bash

FILE="test.txt"

# Tạo file test.txt mẫu nếu chưa có
if [ ! -f "$FILE" ]; then
    echo "File $FILE không tồn tại. Đang tạo file mẫu..."
    echo -e "lap trinh shell\nhe dieu hanh linux\nunix\nbash script" > "$FILE"
fi

read -p "Nhập vào một chuỗi cần tìm: " search_string

# Tìm chuỗi trong file (ẩn output với -q)
if grep -q "$search_string" "$FILE"; then
    echo "Chuỗi '$search_string' CÓ tồn tại trong file $FILE."
else
    echo "Chuỗi '$search_string' KHÔNG tồn tại trong file $FILE."
fi
