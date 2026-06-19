"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserOrRedirect } from "@/lib/data";
import type { ExpenseCategory } from "@/lib/types";

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string(),
  description: z.string().max(120).optional(),
  merchant: z.string().max(80).optional(),
  spent_at: z.string(),
});

export async function addExpenseAction(input: {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  merchant?: string;
  spent_at: string;
}) {
  const { user, supabase } = await getUserOrRedirect();
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    category: parsed.data.category,
    description: parsed.data.description || null,
    merchant: parsed.data.merchant || null,
    spent_at: parsed.data.spent_at,
  });
  if (error) return { error: error.message };

  revalidatePath("/analytics");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpenseAction(id: string) {
  const { user, supabase } = await getUserOrRedirect();
  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
  return { success: true };
}
