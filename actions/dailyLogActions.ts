"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function getTodayDate() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

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

  const today = getTodayDate();

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

  const targetDate = date ?? getTodayDate();
  const logs = await prisma.dailyLog.findMany({
    where: { userId: user.id, date: targetDate },
  });
  return logs;
}
