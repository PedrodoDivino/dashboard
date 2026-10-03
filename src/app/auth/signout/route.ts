import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Encerra a sessão e volta ao login (usado quando a conta foi desativada durante o uso). */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  const reason = searchParams.get("reason");
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login${reason ? `?error=${encodeURIComponent(reason)}` : ""}`);
}
