"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { GoogleGMark } from "@/components/auth/google-g-mark";
import type { OperatorAuthUiFlags } from "@/components/auth/operator-login-form";
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

const MIN_PASSWORD_LEN = 8;

export type OperatorSignUpFormProps = {
  title: string;
  description: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmitEmailSignUp: () => void;
  onGoogleSignUp: () => void;
  onWeb3SignUp: () => void;
  authUi: OperatorAuthUiFlags;
  isPending: boolean;
  message: string;
  signInHref: Route;
  className?: string;
};

function passwordValidationMessage(password: string, confirm: string) {
  if (password.length > 0 && password.length < MIN_PASSWORD_LEN) {
    return `Use at least ${MIN_PASSWORD_LEN} characters for your password.`;
  }
  if (confirm.length > 0 && password !== confirm) {
    return "Passwords do not match.";
  }
  return "";
}

/** Operator registration for access identity; treasury wallet linkage follows after sign-in. */
export function OperatorSignUpForm({
  title,
  description,
  fullName,
  email,
  password,
  confirmPassword,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmitEmailSignUp,
  onGoogleSignUp,
  onWeb3SignUp,
  authUi,
  isPending,
  message,
  signInHref,
  className,
}: OperatorSignUpFormProps) {
  const validationHint = passwordValidationMessage(password, confirmPassword);
  const passwordsOk =
    password.length >= MIN_PASSWORD_LEN && password === confirmPassword;

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
              if (!passwordsOk || !authUi.enableEmailPassword) {
                return;
              }
              onSubmitEmailSignUp();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="operator-signup-name">Full name (optional)</Label>
              <Input
                id="operator-signup-name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={fullName}
                onChange={(event) => onFullNameChange(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="operator-signup-email">Email</Label>
              <Input
                id="operator-signup-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="operator-signup-password">Password</Label>
              <Input
                id="operator-signup-password"
                type="password"
                autoComplete="new-password"
                placeholder={`At least ${MIN_PASSWORD_LEN} characters`}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                required
                minLength={MIN_PASSWORD_LEN}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="operator-signup-confirm">Confirm password</Label>
              <Input
                id="operator-signup-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(event) =>
                  onConfirmPasswordChange(event.target.value)
                }
                required
                minLength={MIN_PASSWORD_LEN}
                aria-invalid={Boolean(validationHint)}
              />
            </div>
            {validationHint ? (
              <output
                className="text-destructive block text-sm"
                aria-live="polite"
              >
                {validationHint}
              </output>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={
                isPending ||
                !authUi.enableEmailPassword ||
                !passwordsOk ||
                !email.trim()
              }
            >
              Create account
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
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                {authUi.enableGoogleOAuth ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={onGoogleSignUp}
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
                    onClick={onWeb3SignUp}
                    className="w-full"
                  >
                    <Wallet
                      className="mr-2 h-[18px] w-[18px] shrink-0 opacity-80"
                      aria-hidden
                    />
                    Continue with wallet
                  </Button>
                ) : null}
              </div>
            </>
          )}

          <p className="text-muted-foreground mt-5 text-center text-sm sm:text-left">
            {message}
          </p>

          <p className="text-muted-foreground mt-4 text-center text-sm sm:text-left">
            Already have an account?{" "}
            <Link
              href={signInHref}
              className="text-primary inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
