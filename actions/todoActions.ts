"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getTodos() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  return await prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
  });
}

export async function createTodo(task: string, dailyGoalTime?: number) {
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
      task,
      dailyGoalTime,
      order: (lastTodo?.order ?? -1) + 1,
      userId: user.id,
    },
  });
}

export async function updateTodo(
  id: string,
  data: { task?: string; completed?: boolean; dailyGoalTime?: number | null; order?: number }
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

export async function deleteTodo(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await prisma.todo.delete({
    where: { id, userId: user.id },
  });
}
