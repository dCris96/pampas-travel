"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getFestividades() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("festividades").select("*");
  if (error) throw error;
  return data;
}
