"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getMitos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("mitos").select("*");
  if (error) throw error;
  return data;
}
