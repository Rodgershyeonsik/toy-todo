export const getCompletionRate = (elapsedTime: number, goalTime: number) => {
  return Math.floor((elapsedTime / (goalTime * 60)) * 100);
};
