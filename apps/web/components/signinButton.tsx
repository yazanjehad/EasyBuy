import React from "react";
import Link from "next/link";
import { getSession, destroySession } from "@/lib/session";

const SignInButton = async () => {
  const session = await getSession();

  return (
    <div className="flex items-center gap-3 ml-auto">
      {!session || !session.user ? (
        <>
          <Link href="/auth/signin" className="hover:underline text-sm font-medium">
            Sign In
          </Link>
          <Link href="/auth/signup" className="hover:underline text-sm font-medium">
            Sign Up
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold">{session.user.name}</p>
          
          {/* ✅ استخدام Form لاستدعاء Server Action بشكل آمن */}
          <form action={destroySession}>
            <button
              type="submit"
              className="hover:underline text-sm font-medium text-white focus:outline-none"
            >
              sign out
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default SignInButton;