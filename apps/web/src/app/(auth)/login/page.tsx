import type { Metadata } from "next";
import Link from "next/link";
import { RoveLogo } from "@repo/ui";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign In | Rove",
  description: "Sign in to your production QA workspace",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex justify-center">
            <RoveLogo size="lg" withContainer={true} subtitle={false} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-xs text-muted-foreground">
            Sign in to your production QA workspace
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
