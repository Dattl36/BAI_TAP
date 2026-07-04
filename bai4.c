#include <stdio.h>
#include <stdbool.h>

int main() {
    int pn[100], bur[100], rem_bur[100], wt[100], tat[100];
    int n, i, qt;
    int current_time = 0;
    int completed = 0;
    int totwt = 0, tottat = 0;

    printf("Enter the number of processes: ");
    scanf("%d", &n);

    printf("Enter quantum time: ");
    scanf("%d", &qt);

    for (i = 0; i < n; i++) {
        printf("Enter Process Name & Burst Time: ");
        scanf("%d %d", &pn[i], &bur[i]);
        rem_bur[i] = bur[i];
        wt[i] = 0;
    }

    printf("\nGantt Chart:\n");
    printf("PName\tStart\tStop\n");

    while (completed != n) {
        bool idle = true;
        for (i = 0; i < n; i++) {
            if (rem_bur[i] > 0) {
                idle = false;
                int start_time = current_time;
                int time_spent = (rem_bur[i] > qt) ? qt : rem_bur[i];
                current_time += time_spent;
                rem_bur[i] -= time_spent;
                
                printf("%d\t%d\t%d\n", pn[i], start_time, current_time);

                if (rem_bur[i] == 0) {
                    completed++;
                    tat[i] = current_time; // Arrival time is 0
                    wt[i] = tat[i] - bur[i];
                    totwt += wt[i];
                    tottat += tat[i];
                }
            }
        }
        if (idle) {
            current_time++;
        }
    }

    printf("\nAverage Waiting Time: %.2f", (float)totwt / n);
    printf("\nAverage Turnaround Time: %.2f\n", (float)tottat / n);

    return 0;
}
