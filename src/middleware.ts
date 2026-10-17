import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routeAccessMap } from "./lib/settings";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route matches any protected route
  let matchingRoute: string | null = null;
  for (const route of Object.keys(routeAccessMap)) {
    const pattern = new RegExp(`^${route}`);
    if (pattern.test(pathname)) {
      matchingRoute = route;
      break;
    }
  }

  // Quick check for Supabase session cookies
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
  );

  // 1. If user is visiting /sign-in and has no session cookie, allow immediately with zero Supabase calls
  if (pathname === "/sign-in" && !hasAuthCookie) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    return response;
  }

  // 2. If user is accessing a protected route without any session cookie, redirect to /sign-in immediately with zero Supabase calls
  if (matchingRoute && !hasAuthCookie) {
    const redirectResponse = NextResponse.redirect(new URL("/sign-in", request.url));
    redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    return redirectResponse;
  }

  // 3. If user is visiting root / with no session cookie, redirect to /sign-in immediately
  if (pathname === "/" && !hasAuthCookie) {
    const redirectResponse = NextResponse.redirect(new URL("/sign-in", request.url));
    redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    return redirectResponse;
  }

  // 4. Public routes with no auth cookie: allow immediately without calling Supabase
  if ((pathname === "/manual" || pathname.startsWith("/manual/")) && !hasAuthCookie) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    return response;
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let user: any = null;
  let role: string | undefined = undefined;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables in middleware");
      const redirectResponse = NextResponse.redirect(new URL("/sign-in", request.url));
      redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      return redirectResponse;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
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

    const userRes = await supabase.auth.getUser();
    user = userRes.data?.user;
    role = user?.user_metadata?.role;
  } catch (authError) {
    console.error("Middleware auth verification error:", authError);
    const redirectResponse = NextResponse.redirect(new URL("/sign-in", request.url));
    redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    return redirectResponse;
  }

  // Matchers logic from previous middleware
  for (const route of Object.keys(routeAccessMap)) {
    // Simple regex matching for routes like /admin(.*)
    const pattern = new RegExp(`^${route}`);
    if (pattern.test(request.nextUrl.pathname)) {
      const allowedRoles = routeAccessMap[route];
      if (!allowedRoles.includes(role || "")) {
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
