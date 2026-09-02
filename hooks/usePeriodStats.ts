import { getDailyLogsByPeriodAction } from "@/actions/dailyLogActions";
import useUserStore from "@/store/useUserStore";
import { StatLog } from "@/types/statistics";
import { toDateKey } from "@/utils";
import { useQuery } from "@tanstack/react-query";

type PeriodStats = {
  startDate: Date;
  endDate: Date;
  data: StatLog[];
};

export const usePeriodStats = (startDate: Date, endDate: Date) => {
  const user = useUserStore((state) => state.user);
  const isValidRange = startDate.getTime() <= endDate.getTime();

  const query = useQuery<PeriodStats, Error>({
    queryKey: [
      "period-stats",
      user?.id,
      toDateKey(startDate),
      toDateKey(endDate),
    ],
    queryFn: () => getDailyLogsByPeriodAction(startDate, endDate, []),
    staleTime: 1000 * 60 * 5,
    enabled: !!user && isValidRange,
  });

  return { ...query, isValidRange };
};
