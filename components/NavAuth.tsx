import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function NavAuth() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-bricktext transition-colors px-3 py-2"
        >
          Mijn sessies
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-sm text-muted hover:text-bricktext transition-colors px-3 py-2"
          >
            Uitloggen
          </button>
        </form>
        <Link href="/start" className="btn-primary text-sm px-5 py-2.5">
          Begin mijn sessie →
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2">
      <Link
        href="/sign-in"
        className="text-sm text-muted hover:text-bricktext transition-colors px-3 py-2"
      >
        Inloggen
      </Link>
      <Link href="/start" className="btn-primary text-sm px-5 py-2.5">
        Begin mijn sessie →
      </Link>
    </div>
  );
}
