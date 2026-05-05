import { redirect } from "next/navigation";

/** Legacy URL; subdomain management is under Subdomains. */
export default function SubscriptionsDomainsLegacyRedirect() {
  redirect("/super-admin/subdomains");
}
