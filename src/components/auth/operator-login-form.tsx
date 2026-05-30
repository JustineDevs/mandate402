"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { GoogleGMark } from "@/components/auth/google-g-mark";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";

export type OperatorAuthUiFlags = {
  enableEmailPassword: boolean;
  enableGoogleOAuth: boolean;
  enableWeb3: boolean;
};

export type OperatorLoginFormProps = {
  title: string;
  description: string;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmitEmailPassword: () => void;
  onGoogleSignIn: () => void;
  onWeb3SignIn: () => void;
  authUi: OperatorAuthUiFlags;
  isPending: boolean;
  message: string;
  /** When set, shows a secondary link to operator registration. */
  createAccountHref?: Route;
  className?: string;
};

/**
 * Operator sign-in layout aligned with shadcn **login-01** (card + stacked fields + SSO),
 * wired to Supabase helpers from the parent gate.
 */
export function OperatorLoginForm({
  title,
  description,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmitEmailPassword,
  onGoogleSignIn,
  onWeb3SignIn,
  authUi,
  isPending,
  message,
  createAccountHref,
  className,
}: OperatorLoginFormProps) {
  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-4 text-center sm:text-left">
          <div className="flex w-full justify-center py-1">
            <Image
              src="/images/mandate402_nav_header(black).png"
              alt="Mandate402"
              width={800}
              height={200}
              className="h-20 w-auto max-w-full object-contain sm:h-24 md:h-28"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl tracking-tight">{title}</h1>
            <CardDescription className="text-pretty pt-1.5">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmitEmailPassword();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="operator-email">Email</Label>
              <Input
                id="operator-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="operator-password">Password</Label>
              <Input
                id="operator-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !authUi.enableEmailPassword}
            >
              Sign in
            </Button>
          </form>

          {(authUi.enableGoogleOAuth || authUi.enableWeb3) && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card text-muted-foreground px-2 font-medium tracking-wide">
                    Other sign-in options
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                {authUi.enableGoogleOAuth ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={onGoogleSignIn}
                    className="w-full border-[#747775] bg-white font-medium text-[#1F1F1F] hover:bg-[#f8f9fa] dark:border-[#8E918F] dark:bg-[#131314] dark:text-[#e3e3e3] dark:hover:bg-[#1f1f1f]"
                  >
                    <GoogleGMark className="mr-2 shrink-0" />
                    Sign in with Google
                  </Button>
                ) : null}
                {authUi.enableWeb3 ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={onWeb3SignIn}
                    className="w-full"
                  >
                    <Wallet
                      className="mr-2 h-[18px] w-[18px] shrink-0 opacity-80"
                      aria-hidden
                    />
                    Sign in with wallet
                  </Button>
                ) : null}
              </div>
            </>
          )}

          <p className="text-muted-foreground mt-5 text-center text-sm sm:text-left">
            {message}
          </p>
          {createAccountHref ? (
            <p className="text-muted-foreground mt-4 text-center text-sm sm:text-left">
              New here?{" "}
              <Link
                href={createAccountHref}
                className="text-primary inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
