import type { Metadata } from "next";

import { AuthForm } from "../_components/auth-form";

export const metadata: Metadata = { title: "Create an account — Mergegate" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
