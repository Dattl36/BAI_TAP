#!/bin/sh

for file in *.c
do
    if grep -q 'main[[:space:]]*(' "$file"
    then
        echo "===== $file ====="
        cat "$file"
    fi
done

exit 0
