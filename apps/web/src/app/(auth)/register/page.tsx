import type { Metadata } from "next";
import Link from "next/link";
import { RoveLogo } from "@repo/ui";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Create Account | Rove",
  description: "Start automated real-browser QA monitoring in minutes",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex justify-center">
            <RoveLogo size="lg" withContainer={true} subtitle={false} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Create your account</h1>
          <p className="text-xs text-muted-foreground">
            Start automated real-browser QA monitoring in minutes
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
