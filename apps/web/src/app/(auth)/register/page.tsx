import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Start automated real-browser QA monitoring in minutes",
};

export default function RegisterPage() {
  return (
    <>
      <div className="text-center space-y-1">
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
    </>
  );
}
