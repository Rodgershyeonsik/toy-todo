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
  // 미인증 유저면 Unauthorized 에러를 던지고 DB를 조회하지 않는다.
  if (!user) throw new Error("Unauthorized");

  // 인증 유저의 startDate, endDate 기간에 해당하면서 todoIds과 todoId가 일치하는 dailylog 배열 조회
  // 단 todosId가 빈 배열일 경우 기간내 모든 dailylog 조회
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId: user.id,
      date: { gte: startDate, lte: endDate },
      ...(todoIds.length > 0 && { todoId: { in: todoIds } }),
    },
  });
  // 리턴 객체에는 실제 조회 시 사용한 startDate, endDate를 포함시키고, 조회 결과는 data 키에 Dailylogs[]로 나온다.
  return { startDate, endDate, data: logs };
}
