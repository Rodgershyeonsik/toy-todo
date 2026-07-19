export type Period = "week" | "month" | "year";

export const getPeriodRange = (
  period: Period,
  refDate: Date
): { startDate: Date; endDate: Date } => {
  const base = new Date(refDate);
  base.setUTCHours(0, 0, 0, 0);

  if (period === "week") {
    const day = base.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;

    const startDate = new Date(base);
    startDate.setUTCDate(startDate.getUTCDate() - diff);

    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);

    return { startDate, endDate };
  }

  if (period === "month") {
    const startDate = new Date(base);
    startDate.setUTCDate(1);

    const endDate = new Date(base);
    endDate.setUTCMonth(base.getUTCMonth() + 1, 0);

    return { startDate, endDate };
  }

  if (period === "year") {
    const startDate = new Date(base);
    startDate.setUTCMonth(0, 1);
    const endDate = new Date(base);
    endDate.setUTCMonth(11, 31);

    return { startDate, endDate };
  }

  throw new Error(`Unknown period: ${period}`);
};
