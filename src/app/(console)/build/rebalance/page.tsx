import type { Route } from "next";
import { redirect } from "next/navigation";

export default function BuildRebalanceRedirectPage() {
  redirect("/treasury/rebalance" as Route);
}
