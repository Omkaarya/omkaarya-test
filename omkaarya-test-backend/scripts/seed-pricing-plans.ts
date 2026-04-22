import "../src/load-env.js";
import pg from "pg";
import { getPoolConfig } from "../src/db/config.js";

type PlanId = "Prarambha" | "Sankalpa" | "Aaradhana";

type PlanSeed = {
  id: PlanId;
  name: string;
  /** Display dollars, e.g. "$19" — converted to integer cents for `pricing_plans` */
  priceMonthly: string;
  priceYearly: string;
  popular: boolean;
  description: string;
  includedSeats: number;
  /** Cents, e.g. 600 = $6.00 */
  extraSeatPriceMonthly: number;
  included: string[];
};

const PLANS: PlanSeed[] = [
  {
    id: "Prarambha",
    name: "Prarambha",
    priceMonthly: "$19",
    priceYearly: "$157",
    popular: false,
    description:
      "Ideal for small temples starting digital management of daily activities and donations.",
    includedSeats: 3,
    extraSeatPriceMonthly: 600,
    included: [
      "Devotee management",
      "Pooja booking (online + manual)",
      "Donations + basic receipts",
      "Temple microsite (subdomain)",
      "Panchangam display",
      "Standard roles",
      "Inventory management - Basic",
    ],
  },
  {
    id: "Sankalpa",
    name: "Sankalpa",
    priceMonthly: "$49",
    priceYearly: "$539",
    popular: true,
    description: "Ideal for growing temples wanting compliance receipts and advanced features.",
    includedSeats: 5,
    extraSeatPriceMonthly: 500,
    included: [
      "Devotee management",
      "Pooja booking (online + manual)",
      "Donations + basic receipts",
      "Temple microsite (subdomain)",
      "Panchangam display",
      "Compliance tax receipts",
      "Full microsite + SEO branding",
      "Inventory management",
      "Extended roles (Trustee · Accountant)",
      "Priority support",
    ],
  },
  {
    id: "Aaradhana",
    name: "Aaradhana",
    priceMonthly: "$99",
    priceYearly: "$1,089",
    popular: false,
    description:
      "Ideal for established temples wanting full control with unlimited customisation.",
    includedSeats: 10,
    extraSeatPriceMonthly: 400,
    included: [
      "Devotee management",
      "Pooja booking (online + manual)",
      "Donations + basic receipts",
      "Temple microsite (subdomain)",
      "Panchangam display",
      "Compliance tax receipts",
      "Full microsite + SEO branding",
      "Inventory management",
      "Extended roles (Trustee · Accountant)",
      "Priority support",
      "Custom domain",
      "Custom roles",
      "Advanced analytics",
    ],
  },
];

const PRICING_MODULE = "pricing_tier";

function parsePriceToCents(s: string): number {
  const n = s.replace(/[$,\s]/g, "");
  const v = parseFloat(n);
  if (Number.isNaN(v) || v < 0) {
    throw new Error(`Invalid price string: ${s}`);
  }
  return Math.round(v * 100);
}

function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
  return base || "feature";
}

/** One stable `key` per display line, deduped by line text */
function buildFeatureNameToKey(names: string[]): Map<string, string> {
  const nameToKey = new Map<string, string>();
  const used = new Set<string>();
  for (const name of names) {
    let base = slugify(name);
    let k = base;
    let n = 2;
    while (used.has(k)) {
      k = `${base}-${n++}`;
    }
    used.add(k);
    nameToKey.set(name, k);
  }
  return nameToKey;
}

async function main() {
  const config = getPoolConfig();
  if (!config) {
    console.error("Missing database config.");
    process.exit(1);
  }

  const client = new pg.Client(config);
  await client.connect();

  const uniqueNames = Array.from(new Set(PLANS.flatMap((p) => p.included))).sort((a, b) =>
    a.localeCompare(b)
  );
  const nameToKey = buildFeatureNameToKey(uniqueNames);

  try {
    await client.query("BEGIN");

    // Remove plan-feature links before deleting plans (no FK, but avoid orphans)
    await client.query(`DELETE FROM public.plan_features`);
    await client.query(`DELETE FROM public.pricing_plans`);

    const nameToFeatureId = new Map<string, number>();
    for (const name of uniqueNames) {
      const key = nameToKey.get(name)!;
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO public.features (name, key, module_key, description, has_limit, limit_type, is_active, is_visible_in_plan_config)
         VALUES ($1, $2, $3, $4, false, null, true, true)
         ON CONFLICT (key) DO UPDATE SET
           name = EXCLUDED.name,
           is_active = true,
           is_visible_in_plan_config = true
         RETURNING id`,
        [name, key, PRICING_MODULE, ""]
      );
      nameToFeatureId.set(name, rows[0].id);
    }

    for (const p of PLANS) {
      const priceMonthly = parsePriceToCents(p.priceMonthly);
      const priceYearly = parsePriceToCents(p.priceYearly);
      const included = p.included;
      const featuresJson = JSON.stringify(included);

      const {
        rows: [planRow],
      } = await client.query<{ id: string }>(
        `INSERT INTO public.pricing_plans
          (name, description, price_monthly, price_yearly, popular, included_seats, extra_seat_price_monthly, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         RETURNING id`,
        [p.name, p.description, priceMonthly, priceYearly, p.popular, p.includedSeats, p.extraSeatPriceMonthly, featuresJson]
      );

      for (const line of included) {
        const featureId = nameToFeatureId.get(line);
        if (featureId === undefined) {
          throw new Error(`Missing feature id for: ${line}`);
        }
        await client.query(
          `INSERT INTO public.plan_features (plan_id, feature_id, is_enabled)
           VALUES ($1, $2, true)
           ON CONFLICT (plan_id, feature_id) DO UPDATE SET is_enabled = EXCLUDED.is_enabled`,
          [planRow.id, featureId]
        );
      }
      console.log(`Plan [${p.id}] ${p.name} inserted (${planRow.id}) — ${included.length} feature links`);
    }

    await client.query("COMMIT");
    console.log(
      `Done: ${PLANS.length} plans, ${uniqueNames.length} unique features in public.features, plan_features links created.`
    );
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
