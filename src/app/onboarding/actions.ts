"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computePersonality, isStudent } from "@/lib/quiz";

export async function saveQuizAction(answers: Record<string, string>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const personality = computePersonality(answers);
  const student = isStudent(answers);

  const { error } = await supabase
    .from("profiles")
    .update({
      quiz_answers: answers,
      personality,
      is_student: student,
      onboarded: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, personality };
}
