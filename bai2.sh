#!/bin/bash

# Bạn có thể thay đổi MY_MSSV thành MSSV thật của bạn
MY_MSSV="1234567" 

while true; do
    read -p "Nhập tên của bạn: " name
    read -p "Nhập MSSV của bạn: " mssv

    if [ "$mssv" = "$MY_MSSV" ]; then
        echo "Xin chào $name, MSSV: $mssv. Bạn đã nhập đúng MSSV!"
        break
    else
        echo "MSSV không đúng với MY_MSSV ($MY_MSSV), vui lòng nhập lại!"
    fi
done
