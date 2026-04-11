"use client";

import { useSearchParams } from "next/navigation";
import {
  ForgotPasswordStepper,
  forgotPasswordStepFromQuery,
} from "@/app/components/temple-admin/ForgotPasswordStepper";

/**
 * Reads `?step=` for `/temple-admin/forgot-password`. Must render under Suspense.
 */
export default function ForgotPasswordShellStepper() {
  const searchParams = useSearchParams();
  const step = forgotPasswordStepFromQuery(searchParams.get("step"));
  return <ForgotPasswordStepper currentStep={step} />;
}
