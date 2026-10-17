"use server";
import { jwtVerify, SignJWT } from "jose";
import { Cookie } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sign } from "node:crypto";

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
};


const secret = process.env.JWT_SECRET!;
const encodeKey = new TextEncoder().encode(secret);

export async function createSession(payload: any) {
  // 1. حساب صلاحية الجلسة (7 أيام)
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 2. إنشاء وتوقيع الـ JWT
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(encodeKey);

  // 3. حفظ التوكن في الكوكي أولاً
  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });

  // 4. إرجاع قيم التوكن بعد التخزين
  return session;
}

export async function getSession() {
  // 1. قراءة التوكن من الكوكي بشكل صحيح
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) return null;

  try {
    // 2. التحقق من صحة التوكن واستخراج الـ payload
    const { payload } = await jwtVerify(sessionToken, encodeKey, {
      algorithms: ["HS256"],
    });

    return payload as Session;
  } catch (error) {
    // 3. في حال كان التوكن منتهي الصلاحية أو غير آمن ترجع null
    console.error("Failed to verify session:", error);
    redirect("/auth/signin"); 
  }
}
export async function destroySession() {
  // 1. حذف كوكيز الجلسة
  const cookieStore = await cookies();
  cookieStore.delete("session");

  // 2. إعادة التوجيه لصفحة تسجيل الدخول
  redirect("/auth/signin");
}

export async function updateToken({
  accessToken,
  refreshToken,
}:{
  accessToken: string;
  refreshToken: string;
}){
  const cookie = (await cookies()).get("session")?.value
  if(!cookie) return redirect("/auth/signin");

  const {payload}=await jwtVerify<Session>(cookie,encodeKey);

  if(!payload) return redirect("/auth/signin");

  const newData:Session={
    user :{
      ...payload.user,
    },
    accessToken,
    refreshToken,
  };    
  await createSession(newData);
    }
  