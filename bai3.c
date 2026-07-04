#include <stdio.h>
#include <stdbool.h>

int main() {
    int pn[100], arr[100], bur[100], rem_bur[100], res[100], wt[100], tat[100], finish[100];
    bool is_completed[100] = {false};
    bool is_started[100] = {false};
    int n, i, completed = 0, current_time = 0;
    int totwt = 0, tottat = 0;

    printf("Enter the number of processes: ");
    scanf("%d", &n);

    for (i = 0; i < n; i++) {
        printf("Enter Process Name, Arrival Time & Burst Time: ");
        scanf("%d %d %d", &pn[i], &arr[i], &bur[i]);
        rem_bur[i] = bur[i];
    }

    while (completed != n) {
        int idx = -1;
        int min_rem = 10000000;

        for (i = 0; i < n; i++) {
            if (arr[i] <= current_time && !is_completed[i]) {
                if (rem_bur[i] < min_rem) {
                    min_rem = rem_bur[i];
                    idx = i;
                }
                if (rem_bur[i] == min_rem) {
                    if (arr[i] < arr[idx]) {
                        idx = i;
                    }
                }
            }
        }

        if (idx != -1) {
            if (!is_started[idx]) {
                res[idx] = current_time - arr[idx];
                is_started[idx] = true;
            }
            rem_bur[idx]--;
            current_time++;

            if (rem_bur[idx] == 0) {
                finish[idx] = current_time;
                tat[idx] = finish[idx] - arr[idx];
                wt[idx] = tat[idx] - bur[idx];
                is_completed[idx] = true;
                completed++;
                totwt += wt[idx];
                tottat += tat[idx];
            }
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
