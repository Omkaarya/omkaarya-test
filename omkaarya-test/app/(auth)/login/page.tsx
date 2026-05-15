import { redirect } from "next/navigation";

/** Legacy path — super-admin sign-in lives at `/super-admin/login`. */
export default function LoginPage() {
  redirect("/super-admin/login");
}
