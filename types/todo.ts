export interface Todo {
  id: string;
  task: string;
  completed: boolean;
  elapsedTime: number;
  dailyGoalTime: number | null;
  isRunning: boolean;
}

export type TodoFormData = {
  task: string;
  dailyGoalTime?: number;
};

export const createTodo = (
  task?: string,
  dailyGoalTime?: number | null
): Todo => ({
  id: crypto.randomUUID(),
  task: task ?? "",
  completed: false,
  elapsedTime: 0,
  dailyGoalTime: dailyGoalTime ?? null,
  isRunning: false,
});
