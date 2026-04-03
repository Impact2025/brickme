import type { NextAuthConfig } from "next-auth";

// Edge-compatible config (geen DB imports)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // 7 dagen
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
  providers: [],
};
