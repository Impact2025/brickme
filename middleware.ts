import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/auth",
  "/api/register",
  "/api/stripe/webhook",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic =
    pathname === "/" ||
    publicRoutes.slice(1).some((r) => pathname.startsWith(r));
  if (!isPublic && !req.auth) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
