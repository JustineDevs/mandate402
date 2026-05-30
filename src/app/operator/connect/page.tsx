import type { Route } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function OperatorConnectPage() {
  redirect("/settings?treasury=1" as Route);
}
