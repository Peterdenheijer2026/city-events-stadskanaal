"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const SUPER_ADMIN_EMAIL = "admin@cityeventsstadskanaal.nl";

export async function deleteUserAccount(targetUserId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Niet ingelogd." };
  }
  if (user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return { error: "Alleen de hoofdbeheerder mag accounts verwijderen." };
  }
  if (user.id === targetUserId) {
    return { error: "Je kunt je eigen account niet verwijderen." };
  }

  try {
    const admin = createAdminClient();
    const { data: targetUser } = await admin.auth.admin.getUserById(targetUserId);
    if (targetUser?.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
      return { error: "Het hoofdbeheerdersaccount kan niet worden verwijderd." };
    }
    const { error } = await admin.auth.admin.deleteUser(targetUserId);
    if (error) return { error: error.message };
    revalidatePath("/beheer");
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Verwijderen mislukt." };
  }
}
