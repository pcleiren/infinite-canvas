import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const loginUrl =
        typeof globalThis.location !== "undefined"
          ? new URL("/api/login", globalThis.location.origin).toString()
          : "/api/login";
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: password.trim() }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Sign-in failed.";
        setError(msg);
        return;
      }
      globalThis.location.assign("/");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="dark min-h-svh bg-background font-sans text-foreground antialiased" lang="en">
      <div className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-8">
        <Card className="w-full max-w-[min(100%,32rem)] border-zinc-800 bg-zinc-950 shadow-2xl sm:max-w-[36rem]">
          <CardHeader className="space-y-3 px-8 pb-2 pt-10 sm:px-10 sm:pt-12">
            <CardTitle className="text-[clamp(1.65rem,4vw,2.35rem)] font-semibold leading-tight tracking-tight">
              Eddie Laan
            </CardTitle>
            <CardDescription className="text-[15px] leading-relaxed text-zinc-400 sm:text-[17px]">
              Enter the site password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 pt-2 sm:px-10 sm:pb-12">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-3">
                <Label htmlFor="site-password" className="text-[15px] sm:text-[16px]">
                  Password
                </Label>
                <Input
                  id="site-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={pending}
                  className="h-12 border-zinc-700 bg-zinc-900/80 px-4 text-[16px] sm:h-14 sm:px-5 sm:text-[17px]"
                />
              </div>
              {error ? <p className="text-[15px] text-red-400 sm:text-[16px]">{error}</p> : null}
              <Button
                type="submit"
                className="h-12 w-full text-[16px] font-medium sm:h-14 sm:text-[17px]"
                disabled={pending}
              >
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
