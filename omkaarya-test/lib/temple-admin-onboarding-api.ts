export type SubmitTempleAdminProfilePayload = {
  fullName: string;
  email: string;
  roles: string[];
  phone: string;
};

export type SubmitTempleAdminProfileResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitTempleAdminProfile(
  payload: SubmitTempleAdminProfilePayload,
): Promise<SubmitTempleAdminProfileResult> {
  // Mock-only per current onboarding implementation.
  // TODO: Replace with `fetch(apiUrl(...))` + proper error parsing when backend endpoint is ready.
  await sleep(250);

  if (!payload.fullName.trim() || !payload.email.trim() || payload.roles.length === 0 || !payload.phone.trim()) {
    return { ok: false, message: "Missing required fields." };
  }

  return { ok: true };
}

