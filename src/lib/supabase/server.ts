import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient({ remember }: { remember?: boolean } = {}) {
  const cookieStore = await cookies();
  const isRemembered = remember ?? (cookieStore.get("syncauth-remember")?.value === "true");

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const opts = { ...options };
              if (isRemembered) {
                opts.maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
                if (opts.expires) {
                  opts.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                }
              }
              cookieStore.set(name, value, opts);
            });
          } catch {
            // Ignore: called from Server Component, cookies are read-only
          }
        },
      },
    }
  );
}
