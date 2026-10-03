"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, Button, Input } from "@repo/ui";
import { resetPassword } from "../actions";

const resetPasswordFormSchema = z
  .object({
    password: z.string().min(4, "New password must be at least 4 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

interface ResetPasswordFormProps {
  initialToken?: string;
}

export function ResetPasswordForm({ initialToken = "" }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = initialToken || searchParams.get("token") || "";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!token) {
      setErrorMessage("Reset token is missing or invalid. Please request a new link.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await resetPassword({ token, newPassword: data.password });
      if (!res.success) {
        setErrorMessage(res.error || "Failed to reset password");
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
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

        {isSuccess ? (
          <div className="text-center space-y-3 py-4">
            <div className="w-12 h-12 rounded-full bg-success/15 text-success border border-success/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Password Reset Successfully</h3>
            <p className="text-xs text-muted-foreground">
              Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              disabled={isPending}
              {...register("password")}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              disabled={isPending}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isPending}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Reset Password
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
