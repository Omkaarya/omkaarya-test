/** Session storage: email used in the forgot-password flow */
export const TEMPLE_FORGOT_EMAIL_KEY = "temple_forgot_email";
/** Session storage: reset token returned after OTP verification */
export const TEMPLE_FORGOT_RESET_TOKEN_KEY = "temple_forgot_reset_token";

export function clearTempleForgotPasswordSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(TEMPLE_FORGOT_EMAIL_KEY);
  sessionStorage.removeItem(TEMPLE_FORGOT_RESET_TOKEN_KEY);
}
