export interface Todo {
  id: string;
  task: string;
  completed: boolean;
  elapsedTime?: number;
  dailyGoalTime?: number;
  isRunning?: boolean;
}
