import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        wachtwoord: { label: "Wachtwoord", type: "password" },
        magicToken: { label: "Magic Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const rijen = await db
          .select()
          .from(gebruikers)
          .where(eq(gebruikers.email, credentials.email as string))
          .limit(1);

        const gebruiker = rijen[0];
        if (!gebruiker) return null;

        // Magic link path
        if (credentials.magicToken) {
          const token = credentials.magicToken as string;
          if (gebruiker.verificatieCode !== token) return null;
          if (!gebruiker.verificatieVerloptOp || gebruiker.verificatieVerloptOp < new Date()) return null;

          await db
            .update(gebruikers)
            .set({ actief: true, verificatieCode: null, verificatieVerloptOp: null })
            .where(eq(gebruikers.userId, gebruiker.userId));

          return {
            id: gebruiker.userId,
            email: gebruiker.email ?? undefined,
            name: gebruiker.naam ?? undefined,
          };
        }

        // Wachtwoord path (legacy)
        if (!credentials.wachtwoord || !gebruiker.wachtwoord) return null;
        if (!gebruiker.actief) return null;
        const geldig = await bcrypt.compare(credentials.wachtwoord as string, gebruiker.wachtwoord);
        if (!geldig) return null;

        return {
          id: gebruiker.userId,
          email: gebruiker.email ?? undefined,
          name: gebruiker.naam ?? undefined,
        };
      },
    }),
  ],
});
