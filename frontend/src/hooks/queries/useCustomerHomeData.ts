import { useQuery } from "@tanstack/react-query";
import { appointmentsApi } from "../../api/appointments.api";
import { vouchersApi } from "../../api/vouchers.api";
import { rewardsApi } from "../../api/rewards.api";
import { queryKeys } from "../../constants/queryKeys";
import { normalizePaginatedResponse } from "../../utils/apiResponse";

export const useCustomerHomeData = () => {
  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list(),
    queryFn: () => appointmentsApi.list({ ordering: "scheduled_start" }),
  });

  const vouchersQuery = useQuery({
    queryKey: queryKeys.vouchers.list(),
    queryFn: () => vouchersApi.list(),
  });

  const rewardsQuery = useQuery({
    queryKey: queryKeys.rewards.list(),
    queryFn: () => rewardsApi.list(),
  });

  const isLoading = appointmentsQuery.isLoading || vouchersQuery.isLoading || rewardsQuery.isLoading;
  const isError = appointmentsQuery.isError || vouchersQuery.isError || rewardsQuery.isError;
  const error = appointmentsQuery.error || vouchersQuery.error || rewardsQuery.error;

  const normalizedAppointments = normalizePaginatedResponse(appointmentsQuery.data ?? []).results;
  const normalizedVouchers = normalizePaginatedResponse(vouchersQuery.data ?? []).results;
  const normalizedRewards = normalizePaginatedResponse(rewardsQuery.data ?? []).results;

  const nextAppointment = normalizedAppointments.find(
    (apt) => apt.status !== "completed" && apt.status !== "cancelled" && apt.status !== "no_show"
  );

  const currentPoints = normalizedRewards.length > 0 ? normalizedRewards[0].balance_after : 0;

  let loyaltyTier = "Bronze Member";
  let tierProgress = 0;
  let nextTierPoints = 200;
  let pointsAway = 200;

  if (currentPoints >= 1000) {
    loyaltyTier = "Platinum VIP Member";
    tierProgress = 100;
    nextTierPoints = 1000;
    pointsAway = 0;
  } else if (currentPoints >= 500) {
    loyaltyTier = "Gold VIP Member";
    nextTierPoints = 1000;
    pointsAway = 1000 - currentPoints;
    tierProgress = Math.round(((currentPoints - 500) / 500) * 100);
  } else if (currentPoints >= 200) {
    loyaltyTier = "Silver Member";
    nextTierPoints = 500;
    pointsAway = 500 - currentPoints;
    tierProgress = Math.round(((currentPoints - 200) / 300) * 100);
  } else {
    loyaltyTier = "Bronze Member";
    nextTierPoints = 200;
    pointsAway = Math.max(0, 200 - currentPoints);
    tierProgress = Math.round((currentPoints / 200) * 100);
  }

  return {
    isLoading,
    isError,
    error,
    nextAppointment,
    activeVouchers: normalizedVouchers.filter((v) => v.status === "active"),
    currentPoints,
    loyaltyTier,
    tierProgress,
    pointsAway,
    nextTierPoints,
    rewardsHistory: normalizedRewards,
    refetch: () => {
      void appointmentsQuery.refetch();
      void vouchersQuery.refetch();
      void rewardsQuery.refetch();
    },
  };
};
