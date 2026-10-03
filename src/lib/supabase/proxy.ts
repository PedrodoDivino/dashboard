import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

// Rotas acessíveis sem login.
const PUBLIC_PATHS = ["/login", "/forgot-password", "/auth"];
// Rotas de acesso que um usuário já logado não precisa ver.
const AUTH_ONLY_PATHS = ["/login", "/forgot-password"];

const matches = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/** Renova a sessão do Supabase a cada requisição e protege as rotas do painel. */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => supabaseResponse.headers.set(key, value));
        },
      },
    },
  );

  // Não colocar código entre createServerClient e getClaims() (orientação do Supabase).
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims?.sub;
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const response = NextResponse.redirect(url);
    // Preserva cookies de sessão renovados.
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  if (!isLoggedIn && !matches(pathname, PUBLIC_PATHS) && pathname !== "/reset-password") {
    return redirectTo("/login");
  }
  if (isLoggedIn && matches(pathname, AUTH_ONLY_PATHS)) {
    return redirectTo("/home");
  }

  return supabaseResponse;
}
