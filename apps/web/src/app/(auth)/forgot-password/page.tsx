import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Recover access to your Rove workspace",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-xs text-muted-foreground">
          Enter your work email and we&apos;ll send you recovery instructions.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
      </p>
    </>
  );
}
