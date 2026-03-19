export interface Todo {
  id: number;
  task: string;
  completed: boolean;
  elapsedTime?: number;
  isRunning?: boolean;
}
