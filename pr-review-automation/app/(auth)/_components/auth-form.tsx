"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GithubMark, Logo } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/feedback";
import { Input, Label } from "@/components/ui/input";
import { githubLoginUrl, login, register } from "@/lib/api";

type Mode = "login" | "register";

const COPY = {
  login: {
    title: "Sign in",
    subtitle: "Use the GitHub account that owns the repositories you want reviewed.",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "New here?",
    switchLink: "Create an account",
    switchHref: "/register",
  },
  register: {
    title: "Create an account",
    subtitle: "Start with GitHub to connect repositories straight away, or register with email.",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/login",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password || (mode === "register" && !name)) {
      setError("Please fill in every field.");
      return;
    }

    setPending(true);
    try {
      if (mode === "register") {
        await register(name.trim(), email.trim(), password);
      }
      // Registering doesn't start a session, so sign in with the same credentials.
      await login(email.trim(), password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col px-4 py-8 sm:px-12 sm:py-12">
      <div className="flex items-center justify-between gap-4 text-sm text-fg-muted lg:justify-end">
        <Logo href="/" tone="paper" size={22} className="lg:hidden" />
        <span>
          {copy.switchText}{" "}
          <Link href={copy.switchHref} className="ml-1 font-semibold">
            {copy.switchLink}
          </Link>
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
        <h1 className="font-display text-[32px] font-bold tracking-[-0.025em] text-fg">{copy.title}</h1>
        <p className="mt-[9px] text-[15px] text-fg-muted">{copy.subtitle}</p>

        <Button
          type="button"
          variant="dark"
          size="lg"
          className="mt-7 h-auto w-full py-[15px] text-[15.5px]"
          onClick={() => {
            window.location.href = githubLoginUrl;
          }}
        >
          <GithubMark size={19} />
          Continue with GitHub
        </Button>

        <div className="my-[26px] flex items-center gap-3.5">
          <span aria-hidden="true" className="h-px flex-1 bg-[#E3E1DC]" />
          <span className="text-[13px] text-fg-faint">or with email</span>
          <span aria-hidden="true" className="h-px flex-1 bg-[#E3E1DC]" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          {error ? <ErrorBanner>{error}</ErrorBanner> : null}

          {mode === "register" ? (
            <div>
              <Label htmlFor="name" className="mb-[7px] text-[13px]">
                Name
              </Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-[11px] px-3.5 py-[13px] text-[14.5px]"
                required
              />
            </div>
          ) : null}

          <div>
            <Label htmlFor="email" className="mb-[7px] text-[13px]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[11px] px-3.5 py-[13px] text-[14.5px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-[7px] text-[13px]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[11px] px-3.5 py-[13px] text-[14.5px]"
              required
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            loading={pending}
            className="h-auto rounded-[11px] py-3.5"
          >
            {pending ? copy.pending : copy.submit}
          </Button>
        </form>

        <p className="mt-6 text-[12.5px] leading-[1.6] text-fg-subtle lg:hidden">
          Mergegate reads your diffs to produce a review and does not retain source code after a run.
        </p>
      </div>
    </div>
  );
}
