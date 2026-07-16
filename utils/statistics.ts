export type Period = "week" | "month" | "year";

export const getPeriodRange = (
  period: Period,
  refDate: Date
): { startDate: Date; endDate: Date } => {
  throw new Error("not implemented");
};
