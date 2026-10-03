"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, Button, Input } from "@repo/ui";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@repo/contract";
import { forgotPassword } from "../actions";

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await forgotPassword(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to send reset link");
      } else {
        setSubmittedEmail(data.email);
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submittedEmail ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-success/15 text-success border border-success/30 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Check your inbox</h3>
            <p className="text-xs text-muted-foreground">
              If an account exists with <strong className="text-foreground">{submittedEmail}</strong>, you will receive a reset link shortly.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              disabled={isPending}
              {...register("email")}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isPending}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
