import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/beheer";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const isTreasurer = user?.email?.toLowerCase() === TREASURER_EMAIL;
      if (isTreasurer && (next === "/beheer" || next.startsWith("/beheer?"))) {
        next = "/beheer/boekhouding";
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/beheer/login?error=auth`);
}
