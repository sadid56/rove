import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your production QA workspace",
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center space-y-1">
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
    </>
  );
}
