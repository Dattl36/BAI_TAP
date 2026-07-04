#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>
#include <time.h>

#define MAX_N 20

int a[MAX_N];
int count = 0;
int n = 10;

sem_t sem_empty;
sem_t sem_full;
pthread_mutex_t mutex;

void* producer(void* arg) {
    while (1) {
        int item = rand() % 100;
        
        sem_wait(&sem_empty);
        pthread_mutex_lock(&mutex);
        
        a[count] = item;
        count++;
        printf("[Producer] Da them %d. So phan tu hien tai: %d\n", item, count);
        
        pthread_mutex_unlock(&mutex);
        sem_post(&sem_full);
        
        sleep(1);
    }
    return NULL;
}

void* consumer(void* arg) {
    while (1) {
        pthread_mutex_lock(&mutex);
        if (count == 0) {
            printf("Nothing in array a\n");
            pthread_mutex_unlock(&mutex);
            sleep(1);
            continue;
        }
        pthread_mutex_unlock(&mutex);

        sem_wait(&sem_full);
        pthread_mutex_lock(&mutex);
        
        count--;
        int item = a[count];
        printf("[Consumer] Da lay %d. So phan tu con lai: %d\n", item, count);
        
        pthread_mutex_unlock(&mutex);
        sem_post(&sem_empty);
        
        sleep(2);
    }
    return NULL;
}

int main() {
    pthread_t prod, cons;
    srand(time(NULL));

    sem_init(&sem_empty, 0, n);
    sem_init(&sem_full, 0, 0);
    pthread_mutex_init(&mutex, NULL);

    pthread_create(&prod, NULL, producer, NULL);
    pthread_create(&cons, NULL, consumer, NULL);

    pthread_join(prod, NULL);
    pthread_join(cons, NULL);

    sem_destroy(&sem_empty);
    sem_destroy(&sem_full);
    pthread_mutex_destroy(&mutex);

    return 0;
}
