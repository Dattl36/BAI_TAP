#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

int sells = 0;
int products = 0;

sem_t sem_empty;
sem_t sem_full;

void* processA(void* arg) {
    while (1) {
        sem_wait(&sem_full);
        sells++;
        printf("Da ban: %d | Ton kho: %d\n", sells, products - sells);
        sem_post(&sem_empty);
        sleep(2);
    }
    return NULL;
}

void* processB(void* arg) {
    while (1) {
        sem_wait(&sem_empty);
        products++;
        printf("San xuat xong san pham thu: %d\n", products);
        sem_post(&sem_full);
        sleep(1);
    }
    return NULL;
}

int main() {
    pthread_t threadA, threadB;
    int buffer_size = 12; 
    
    sem_init(&sem_empty, 0, buffer_size); 
    sem_init(&sem_full, 0, 0);

    pthread_create(&threadA, NULL, processA, NULL);
    pthread_create(&threadB, NULL, processB, NULL);

    pthread_join(threadA, NULL);
    pthread_join(threadB, NULL);

    sem_destroy(&sem_empty);
    sem_destroy(&sem_full);

    return 0;
}
