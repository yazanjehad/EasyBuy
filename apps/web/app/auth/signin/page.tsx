import React from "react";
import Link from "next/link";
import SignInForm from "./signinFrom";

const SigninPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">Sign In Page</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <SignInForm />

      <div className="flex gap-1 text-sm">
        <p className="text-muted-foreground">Don't have an account?</p>
        <Link className="underline text-primary font-medium" href="/auth/signup">
          sign up
        </Link>
      </div>
    </div>
  );
};

export default SigninPage;