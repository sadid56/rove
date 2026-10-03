"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, Button, Input } from "@repo/ui";
import { signInSchema, type SignInInput } from "@repo/contract";
import { signIn } from "../actions";

export function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (data: SignInInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await signIn(data);
      if (!res.success) {
        setErrorMessage(res.error || "Invalid credentials");
      } else {
        window.location.href = "/dashboard";
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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              disabled={isPending}
              {...register("password")}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isPending}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
