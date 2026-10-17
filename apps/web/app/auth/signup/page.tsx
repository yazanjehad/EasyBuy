import React from "react";
import Link from "next/link";
import SignupForm from "./signupFrom";

const singUpPage=() => {
  return (
  <div className="   flex min-h-screen flex-col items-center justify-center p-24 ">
    <h1 className="text-2xl font-bold">Sign Up Page</h1>
    {/* Add your sign-up form or content here */}
    <SignupForm />

 <div className="flex gap-1 text-sm">
  <p>Already have an account?</p>
  <Link className="underline text-blue-600" href="/auth/signin">sign in</Link>
</div>
  </div>
  );
};

export default singUpPage