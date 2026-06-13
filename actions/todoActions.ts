"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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
