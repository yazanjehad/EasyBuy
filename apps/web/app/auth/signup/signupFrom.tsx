// apps/web/app/auth/signup/signupFrom.tsx
"use client";
import React from "react";
import {Label} from "@/components/ui/label";
import SubmitButton from "@/components/ui/submitButton";
import { signup } from "@/lib/auth";
import { useFormState } from "react-dom";

const SignupForm = () => {
            const [state, formAction] = useFormState(signup,undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
            {state?.message &&  (
                <p className="text-red-500">{state.message}</p>
            )}
            <Label htmlFor="name">name</Label>
            <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        {state?.errors?.name && (
            <p className="text-red-500">{state.errors.name.join(", ")}</p>
        )}
        <div className="flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        {state?.errors?.email && (
            <p className="text-red-500">{state.errors.email.join(", ")}</p>
        )}
        <div className="flex flex-col gap-1">
            <Label htmlFor="password">Password</Label>
            <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />  
 {state?.errors?.password && (
  <div className="space-y-1 mt-1">
    <p className="text-xs font-medium text-destructive">
      Password requirements:
    </p>
    <ul className="list-disc list-inside text-xs text-destructive space-y-0.5">
      {state.errors.password.map((error, index) => (
        <li key={index}>
          {error}
        </li>
      ))}
    </ul>
  </div>
)}
            
        </div>
    <SubmitButton>
            Sign Up
        </SubmitButton>
    </form>
  );
};

export default SignupForm;