#!/bin/bash

while true; do
    read -p "Nhập vào một số n (n >= 10): " n
    
    # Kiểm tra n có phải là số và n >= 10 không
    if [[ "$n" =~ ^[0-9]+$ ]] && [ "$n" -ge 10 ]; then
        break
    else
        echo "Số n phải là số nguyên và n >= 10. Vui lòng nhập lại!"
    fi
done

sum=0
for (( i=1; i<=n; i++ )); do
    sum=$((sum + i))
done

echo "Tổng các số từ 1 đến $n là: $sum"
