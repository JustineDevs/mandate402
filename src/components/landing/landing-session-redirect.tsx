"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getSupabaseBrowserClient } from "@/lib/infrastructure/supabase-browser";

export function LandingSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    const client = getSupabaseBrowserClient();

    void client.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        router.replace("/operator");
      }
    });
  }, [router]);

  return null;
}
