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
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Inloggen mislukt.";
        setError(msg);
        return;
      }
      window.location.assign("/");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="dark min-h-svh bg-background font-sans text-foreground antialiased">
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm border-zinc-800 bg-zinc-950 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl tracking-tight">Eddie Laan</CardTitle>
            <CardDescription className="text-zinc-400">Voer het site-wachtwoord in om verder te gaan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="site-password">Wachtwoord</Label>
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
                  className="border-zinc-700 bg-zinc-900/80"
                />
              </div>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Bezig…" : "Aanmelden"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
