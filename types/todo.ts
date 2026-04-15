export interface Todo {
  id: string;
  task: string;
  completed: boolean;
  elapsedTime: number;
  dailyGoalTime?: number;
  isRunning: boolean;
}

export type TodoFormData = Pick<Todo, "task" | "dailyGoalTime">;

export const createTodo = (task?: string, dailyGoalTime?: number): Todo => ({
  id: crypto.randomUUID(),
  task: task ?? "",
  completed: false,
  elapsedTime: 0,
  dailyGoalTime: dailyGoalTime,
  isRunning: false,
});
