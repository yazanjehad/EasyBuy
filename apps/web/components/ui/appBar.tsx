import React from "react";
import Link from "next/link";
import SigninButton from "../signinButton";

const AppBar = () => {
  return (
    <header className="w-full bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-500 text-white shadow-md">
      <div className="flex h-16 items-center justify-between px-6 mx-auto">
        {/* جهة اليسار: روابط Navigation */}
        <div className="flex items-center space-x-6 text-lg font-medium">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            Home
          </Link>
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            Dashboard
          </Link>

          <Link href={"/profile"}>profile</Link>
        
        </div>

        {/* جهة اليمين: زر تسجيل الدخول أو بيانات الجلسة */}
        <div>
          <SigninButton />
        </div>
      </div>
    </header>
  );
};

export default AppBar;