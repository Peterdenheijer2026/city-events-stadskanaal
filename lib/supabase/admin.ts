import { createClient } from "@supabase/supabase-js";

/**
 * Alleen op de server gebruiken (Server Actions, API routes).
 * Gebruikt de service role key om o.a. gebruikers te verwijderen.
 * NOOIT in client code importeren of NEXT_PUBLIC_ geven.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
