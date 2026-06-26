#!/bin/sh

MY_MSSV="CT230002"

while true; do
    printf "Nhập vào họ tên: "
    read name
    printf "Nhập vào MSSV: "
    read mssv

    if [ "$mssv" = "$MY_MSSV" ]; then
        echo "MSSV chính xác!"
        break
    else
        echo "MSSV không trùng khớp. Vui lòng nhập lại!"
        echo "----------------------------------------"
    fi
done

echo ""
echo "=== KẾT QUẢ ==="
echo "Họ và tên: $name"
echo "MSSV: $mssv"

exit 0
