#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/wait.h>

pid_t child_pid = -1;

void handle_sigint(int sig) {
    if (child_pid > 0) {
        kill(child_pid, SIGKILL);
    }
    printf("\nYou are pressed CTRL+C! Goodbye!\n");
    exit(0);
}

int main() {
    printf("Welcome to IT007, I am 12345678!\n");

    signal(SIGINT, handle_sigint);

    child_pid = fork();

    if (child_pid < 0) {
        perror("fork failed");
        exit(1);
    } else if (child_pid == 0) {
        execlp("vi", "vi", "abcd.txt", NULL);
        perror("execlp failed"); 
        exit(1);
    } else {
        int status;
        waitpid(child_pid, &status, 0);
    }

    return 0;
}
