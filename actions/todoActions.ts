"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getTodosAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todos = await prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
    include: {
      dailyLogs: {
        where: { date: today },
      },
    },
  });

  return todos.map((todo) => ({
    id: todo.id,
    task: todo.task,
    completed: todo.completed,
    dailyGoalTime: todo.dailyGoalTime,
    elapsedTime: todo.dailyLogs[0]?.elapsedTime ?? 0,
    isRunning: false,
  }));
}

export async function createTodoAction(
  id: string,
  task: string,
  dailyGoalTime: number | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const lastTodo = await prisma.todo.findFirst({
    where: { userId: user.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return await prisma.todo.create({
    data: {
      id,
      task,
      dailyGoalTime,
      order: (lastTodo?.order ?? -1) + 1,
      userId: user.id,
    },
  });
}

export async function updateTodoAction(
  id: string,
  data: {
    task?: string;
    completed?: boolean;
    dailyGoalTime?: number | null;
    order?: number;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  return await prisma.todo.update({
    where: { id, userId: user.id },
    data,
  });
}

export async function upsertTodoAction(
  id: string,
  data: {
    task: string;
    completed: boolean;
    dailyGoalTime: number | null;
    order?: number;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const existing = await prisma.todo.findUnique({ where: { id } });

  if (existing && user) {
    if (existing.userId !== user.id) throw new Error("Forbidden"); // 보안 체크 해결
    return updateTodoAction(id, data);
  } else {
    return createTodoAction(id, data.task, data.dailyGoalTime);
  }
}

export async function deleteTodoAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await prisma.todo.delete({
    where: { id, userId: user.id },
  });
}
