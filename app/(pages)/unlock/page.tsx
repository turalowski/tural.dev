import { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { isUnlocked, UNLOCK_CODE, UNLOCK_COOKIE } from "@/app/lib/unlock";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unlock",
  robots: { index: false, follow: false },
};

async function unlock(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "");

  if (code !== UNLOCK_CODE) {
    redirect("/unlock?error=1");
  }

  cookies().set(UNLOCK_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/");
}

async function lock() {
  "use server";
  cookies().delete(UNLOCK_COOKIE);
  redirect("/");
}

interface UnlockPageProps {
  searchParams: { error?: string };
}

export default function UnlockPage({ searchParams }: UnlockPageProps) {
  const unlocked = isUnlocked();

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4 py-6">
      {unlocked ? (
        <form action={lock} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Hidden articles are visible on this device.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">Back to articles</Link>
            </Button>
            <Button type="submit" variant="ghost">
              Lock
            </Button>
          </div>
        </form>
      ) : (
        <form action={unlock} className="space-y-3">
          <label
            htmlFor="code"
            className="block text-sm font-medium text-foreground"
          >
            Access code
          </label>
          <input
            id="code"
            name="code"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {searchParams.error && (
            <p className="text-xs text-destructive">That code is not valid.</p>
          )}
          <Button type="submit" className="w-full">
            Unlock
          </Button>
        </form>
      )}
    </div>
  );
}
