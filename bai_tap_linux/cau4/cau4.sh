#!/bin/sh

# Xác định thư mục của script
SCRIPT_DIR=$(dirname "$0")
FILE_PATH="$SCRIPT_DIR/test.txt"

# Kiểm tra xem file test.txt có tồn tại không
if [ ! -f "$FILE_PATH" ]; then
    echo "Lỗi: File '$FILE_PATH' không tồn tại!"
    echo "Vui lòng tạo file 'test.txt' cùng thư mục với script trước khi chạy."
    exit 1
fi

# Nhập chuỗi tìm kiếm từ người dùng
printf "Nhập vào chuỗi cần tìm: "
read search_str

# Kiểm tra chuỗi rỗng
if [ -z "$search_str" ]; then
    echo "Lỗi: Chuỗi nhập vào không được để trống!"
    exit 1
fi

# Kiểm tra sự tồn tại của chuỗi trong file
# -q: không xuất kết quả ra màn hình (quiet mode)
# -F: tìm kiếm chuỗi cố định (không xử lý regex để tránh lỗi ký tự đặc biệt)
if grep -q -F "$search_str" "$FILE_PATH"; then
    echo "Kết quả: Chuỗi '$search_str' CÓ tồn tại trong file '$(basename "$FILE_PATH")'."
else
    echo "Kết quả: Chuỗi '$search_str' KHÔNG tồn tại trong file '$(basename "$FILE_PATH")'."
fi

exit 0
