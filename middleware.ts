import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/",
  "/start",
  "/sign-in",
  "/sign-up",
  "/verify-magic",
  "/api/auth",
  "/api/register",
  "/api/stripe/webhook",
  "/blog",
  "/api/blog",
  "/privacy",
  "/voorwaarden",
  "/professionals",
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|eot)$).*)"],
};
