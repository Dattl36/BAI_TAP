#include <stdio.h>
#include <pthread.h>
#include <unistd.h>

int x = 0;
pthread_mutex_t mutex;

void* processA(void* arg) {
    while (1) {
        pthread_mutex_lock(&mutex);
        x = x + 1;
        if (x == 20) {
            x = 0;
        }
        printf("Process A: x = %d\n", x);
        pthread_mutex_unlock(&mutex);
        
        usleep(100000);
    }
    return NULL;
}

void* processB(void* arg) {
    while (1) {
        pthread_mutex_lock(&mutex);
        x = x + 1;
        if (x == 20) {
            x = 0;
        }
        printf("Process B: x = %d\n", x);
        pthread_mutex_unlock(&mutex);
        
        usleep(100000);
    }
    return NULL;
}

int main() {
    pthread_t threadA, threadB;
    
    pthread_mutex_init(&mutex, NULL);
    
    pthread_create(&threadA, NULL, processA, NULL);
    pthread_create(&threadB, NULL, processB, NULL);
    
    pthread_join(threadA, NULL);
    pthread_join(threadB, NULL);
    
    pthread_mutex_destroy(&mutex);
    
    return 0;
}
