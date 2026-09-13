"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getTodayInKST } from "@/utils";

export async function upsertDailyLogAction(
  todoId: string,
  elapsedTime: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    select: { userId: true },
  });
  if (!todo || todo.userId !== user.id) throw new Error("Forbidden");

  const today = getTodayInKST();

  return await prisma.dailyLog.upsert({
    where: { todoId_date: { todoId, date: today } },
    update: { elapsedTime },
    create: { todoId, userId: user.id, date: today, elapsedTime },
  });
}

export async function getDailyLogsAction(date?: Date) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const targetDate = date ?? getTodayInKST();
  const logs = await prisma.dailyLog.findMany({
    where: { userId: user.id, date: targetDate },
  });
  return logs;
}

export async function getDailyLogsByPeriodAction(
  startDate: Date,
  endDate: Date,
  todoIds: string[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 인증 유저의 startDate, endDate 기간에 해당하면서 todoIds과 todoId가 일치하는 dailylog 배열 조회
  // todosId가 빈 배열일 경우 기간내 모든 dailylog 조회
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId: user.id,
      date: { gte: startDate, lte: endDate },
      ...(todoIds.length > 0 && { todoId: { in: todoIds } }),
    },

    include: { todo: { select: { task: true } } },
    orderBy: { date: "asc" },
  });

  return { startDate, endDate, data: logs };
}
