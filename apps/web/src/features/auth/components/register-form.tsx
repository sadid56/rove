"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, Button, Input } from "@repo/ui";
import { signUpSchema, type SignUpInput } from "@repo/contract";
import { signUp } from "../actions";

export function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = (data: SignUpInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await signUp(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to create account");
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
            label="Full Name"
            placeholder="Jane Doe"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.name?.message}
            disabled={isPending}
            {...register("name")}
          />

          <Input
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            disabled={isPending}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            disabled={isPending}
            {...register("password")}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isPending}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
