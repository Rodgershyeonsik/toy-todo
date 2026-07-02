import { getDailyLogsAction } from "@/actions/dailyLogActions";
import useUserStore from "@/store/useUserStore";
import { DailyLog } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export const useDailyLogs = () => {
  const user = useUserStore((state) => state.user);

  const query = useQuery<DailyLog[], Error>({
    queryKey: user ? ["daily-logs", user.id] : ["daily-logs"],
    queryFn: () => getDailyLogsAction(),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  return query;
};
