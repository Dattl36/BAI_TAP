#!/bin/sh

while true; do
    printf "Nhập vào một số nguyên n: "
    read n

    case "$n" in
        ''|*[!0-9]*) 
            echo "Lỗi: Vui lòng nhập một số nguyên hợp lệ!"
            echo "----------------------------------------"
            continue 
            ;;
        *) ;;
    esac

    if [ "$n" -lt 10 ]; then
        echo "Lỗi: Số n phải lớn hơn hoặc bằng 10. Vui lòng nhập lại!"
        echo "----------------------------------------"
    else
        break
    fi
done

sum=0
i=1
while [ "$i" -le "$n" ]; do
    sum=$((sum + i))
    i=$((i + 1))
done

echo "----------------------------------------"
echo "Kết quả: Tổng các số từ 1 đến $n là: $sum"

exit 0
