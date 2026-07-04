import { upsertDailyLogAction } from "@/actions/dailyLogActions";
import useUserStore from "@/store/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDailyLogMutation = () => {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const upsertMutation = useMutation({
    mutationFn: ({
      todoId,
      elapsedTime,
    }: {
      todoId: string;
      elapsedTime: number;
    }) => upsertDailyLogAction(todoId, elapsedTime),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: user ? ["daily-logs", user.id] : ["daily-logs"],
      });
    },
  });

  return {
    upsertDailyLog: upsertMutation.mutate,
    upsertDailyLogAsync: upsertMutation.mutateAsync,
  };
};
