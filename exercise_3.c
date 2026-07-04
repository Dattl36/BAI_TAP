#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void* thread_function(void* arg) {
    printf("Tiểu trình (Thread) đang chạy...\n");
    sleep(2);
    printf("Tiểu trình (Thread) kết thúc.\n");
    pthread_exit(NULL);
}

int main() {
    pthread_t thread;
    pthread_attr_t attr;
    int rc;

    pthread_attr_init(&attr);

    pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);

    printf("Tạo tiểu trình với thuộc tính DETACHED...\n");
    rc = pthread_create(&thread, &attr, thread_function, NULL);
    if (rc) {
        printf("Lỗi: pthread_create() trả về %d\n", rc);
        exit(-1);
    }

    pthread_attr_destroy(&attr);

    printf("Tiến trình chính đang đợi (không dùng pthread_join)...\n");
    sleep(3);
    printf("Tiến trình chính kết thúc.\n");

    return 0;
}
