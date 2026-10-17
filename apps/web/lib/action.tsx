"use server";

import { BACKEND_URL } from "./constants";
import { getSession } from "./session";

export const getProfile = async () => {
  const session = await getSession();
  
  // 🔍 فحص الـ Session في التيرمينال
  console.log("Session Data:", session);

  if (!session?.accessToken) {
    console.error("No access token found in session!");
    return { error: "No access token" };
  }

  const response = await fetch(`${BACKEND_URL}/auth/protected`, {
    headers: {
      authorization: `Bearer ${session.accessToken}`,
    },
  });

  console.log("Response Status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backend Error Response:", errorText);
    return null;
  }

  const result = await response.json();
  return result;
};