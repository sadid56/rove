import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, RoveLogo } from "@repo/ui";
import { ResetPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Set New Password | Rove",
  description: "Set a new secure password for your Rove workspace",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage(props: ResetPasswordPageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams.token || "";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex justify-center">
            <RoveLogo size="lg" withContainer={true} subtitle={false} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Set new password</h1>
          <p className="text-xs text-muted-foreground">
            Choose a strong, unique password for your workspace
          </p>
        </div>

        <Suspense
          fallback={
            <Card>
              <CardContent className="p-6 text-center text-xs text-muted-foreground">
                Loading password reset...
              </CardContent>
            </Card>
          }
        >
          <ResetPasswordForm initialToken={token} />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
