import { redirect } from "next/navigation";

/** Legacy URL; canonical subscriptions UI lives under Finance & Billing. */
export default function SubscriptionsLegacyRedirect() {
  redirect("/super-admin/finance/subscriptions");
}
