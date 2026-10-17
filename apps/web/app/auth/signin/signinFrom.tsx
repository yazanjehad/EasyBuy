"use client";

import React, { useActionState } from "react"; // 👈 استيراد useActionState من react
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/ui/submitButton";
import { signin } from "@/lib/auth";

const SignInForm = () => {
  const [state, formAction] = useActionState(signin, undefined); // 👈 تحديث الهوك هنا

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      {/* رسالة الخطأ العامة */}
      {state?.message && (
        <p className="text-sm font-medium text-red-500">{state.message}</p>
      )}

      {/* حقل البريد الإلكتروني */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          required
        />
        {state?.errors?.email && (
          <p className="text-xs text-red-500">{state.errors.email.join(", ")}</p>
        )}
      </div>

      {/* حقل كلمة المرور */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          required
        />
        {state?.errors?.password && (
          <p className="text-xs text-red-500">{state.errors.password.join(", ")}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Link href="#" className="text-sm text-primary hover:underline font-medium">
          Forgot Password?
        </Link>
      </div>

      <SubmitButton>Sign In</SubmitButton>
    </form>
  );
};

export default SignInForm;