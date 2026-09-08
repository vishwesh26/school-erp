import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routeAccessMap } from "./lib/settings";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Role check
  const role = user?.user_metadata?.role;

  // Matchers logic from previous middleware
  for (const route of Object.keys(routeAccessMap)) {
    // Simple regex matching for routes like /admin(.*)
    // Adjusting regex to match the pattern keys in routeAccessMap
    const pattern = new RegExp(`^${route}`);
    if (pattern.test(request.nextUrl.pathname)) {
      const allowedRoles = routeAccessMap[route];
      if (!allowedRoles.includes(role)) {
        const redirectResponse = NextResponse.redirect(new URL(role ? `/${role}` : "/sign-in", request.url));
        redirectResponse.headers.set(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
        );
        return redirectResponse;
      }
    }
  }

  // Ensure all HTML / page responses are never cached by CDN or browser
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
