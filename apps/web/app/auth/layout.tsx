// 
import React ,{ PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      {children}
    </div>
  );
};

export default AuthLayout;