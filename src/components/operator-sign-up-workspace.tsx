"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { OperatorSignUpForm } from "@/components/auth/operator-sign-up-form";
import { getSupabaseAuthUiConfig } from "@/lib/infrastructure/env";
import {
  ensureOperatorProfileFromSession,
  formatOperatorAuthErrorMessage,
  getSupabaseBrowserClient,
  signInOperatorWithGoogle,
  signInOperatorWithWeb3,
  signUpOperatorWithEmailPassword,
} from "@/lib/infrastructure/supabase-browser";

const operatorHref = "/operator" as Route;
const operatorSettingsHref = "/settings?treasury=1" as Route;

export function OperatorSignUpWorkspace() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(
    "Create an operator account. If email confirmation is enabled, check your inbox before signing in.",
  );
  const [isPending, startTransition] = useTransition();

  const supabase = getSupabaseBrowserClient();
  const authUi = getSupabaseAuthUiConfig();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        void ensureOperatorProfileFromSession(data.session)
          .catch(() => undefined)
          .finally(() => router.replace(operatorSettingsHref));
      }
    });
  }, [router, supabase]);

  return (
    <div className="mx-auto my-8 flex w-full max-w-md justify-center px-4">
      <OperatorSignUpForm
        className="w-full"
        title="Create operator account"
        description="Use email, Google, or a wallet. Link a treasury wallet under Settings after sign-in."
        fullName={fullName}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        onFullNameChange={setFullName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        authUi={authUi}
        isPending={isPending}
        message={message}
        signInHref={operatorHref}
        onSubmitEmailSignUp={() =>
          startTransition(async () => {
            setMessage("Creating account…");
            const { data, error } = await signUpOperatorWithEmailPassword({
              email,
              password,
              fullName: fullName.trim() || undefined,
            });
            if (error) {
              setMessage(formatOperatorAuthErrorMessage(error, "sign_up"));
              return;
            }
            if (data.session?.access_token) {
              await ensureOperatorProfileFromSession(data.session);
              setMessage("Account ready. Opening setup…");
              router.replace(operatorSettingsHref);
              return;
            }
            if (data.user) {
              setMessage(
                `Check your email (${email.trim()}) to confirm the account, then sign in.`,
              );
              return;
            }
            setMessage("Unexpected response from sign-up. Try again.");
          })
        }
        onGoogleSignUp={() =>
          startTransition(async () => {
            setMessage("Redirecting…");
            const { error } = await signInOperatorWithGoogle();
            if (error) {
              setMessage(error.message);
            }
          })
        }
        onWeb3SignUp={() =>
          startTransition(async () => {
            setMessage("Waiting for signature…");
            const { data, error } = await signInOperatorWithWeb3();
            if (error) {
              setMessage(error.message);
              return;
            }
            if (data.session?.access_token) {
              await ensureOperatorProfileFromSession(data.session);
              router.replace(operatorSettingsHref);
              return;
            }
            setMessage(
              "Complete the wallet sign-in flow, then open Settings to link a treasury wallet.",
            );
          })
        }
      />
    </div>
  );
}
