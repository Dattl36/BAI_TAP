#include <stdio.h>
#include <stdbool.h>

int main() {
    int pn[100], arr[100], bur[100], res[100], wt[100], tat[100], finish[100];
    bool is_completed[100] = {false};
    int n, i, completed = 0, current_time = 0;
    int totwt = 0, tottat = 0;

    printf("Enter the number of processes: ");
    scanf("%d", &n);

    for (i = 0; i < n; i++) {
        printf("Enter Process Name, Arrival Time & Burst Time: ");
        scanf("%d %d %d", &pn[i], &arr[i], &bur[i]);
    }

    while (completed != n) {
        int idx = -1;
        int min_bur = 10000000;

        for (i = 0; i < n; i++) {
            if (arr[i] <= current_time && !is_completed[i]) {
                if (bur[i] < min_bur) {
                    min_bur = bur[i];
                    idx = i;
                }
                if (bur[i] == min_bur) {
                    if (arr[i] < arr[idx]) {
                        idx = i;
                    }
                }
            }
        }

        if (idx != -1) {
            res[idx] = current_time - arr[idx]; // wait time before starting
            wt[idx] = current_time - arr[idx];
            current_time += bur[idx];
            finish[idx] = current_time;
            tat[idx] = finish[idx] - arr[idx];
            is_completed[idx] = true;
            completed++;
            totwt += wt[idx];
            tottat += tat[idx];
        } else {
            current_time++;
        }
    }

    printf("\nPName\tResponse\tWaiting\t\tTurnaround\n");
    for (i = 0; i < n; i++) {
        printf("%d\t%d\t\t%d\t\t%d\n", pn[i], res[i], wt[i], tat[i]);
    }

    printf("\nAverage Waiting Time: %.2f", (float)totwt / n);
    printf("\nAverage Turnaround Time: %.2f\n", (float)tottat / n);

    return 0;
}
