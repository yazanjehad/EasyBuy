"use server";

const { BACKEND_URL } = require("./constants");
import { SignupFormSchema, FormState, loginFormSchema } from "./type";
import { redirect } from "next/navigation";
import { createSession, updateToken } from "./session";

export async function signup(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. التحقق من صحة البيانات باستخدام Zod
  const validationErrors = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // 2. إذا وجد خطأ في البيانات المدخلة
  if (!validationErrors.success) {
    return {
      errors: validationErrors.error.flatten().fieldErrors,
    };
  }

  // 3. إرسال الطلب للـ Backend (NestJS)
  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validationErrors.data),
  });

  // 4. معالجة الاستجابة
  if (response.ok) {
    redirect("/auth/signin");
  } else {
    return {
      message:
        response.status === 409
          ? "Email already exists."
          : response.statusText || "An error occurred. Please try again.",
    };
  }
}

export async function signin(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. التحقق من صحة البيانات باستخدام Zod
  const validationErrors = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // 2. إذا وجد خطأ في البيانات المدخلة
  if (!validationErrors.success) {
    return {
      errors: validationErrors.error.flatten().fieldErrors,
    };
  }

  // 3. إرسال الطلب للـ Backend (NestJS) مع إضافة try/catch للتعامل مع أخطاء الاتصال بالشبكة
  try {
    const response = await fetch(`${BACKEND_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationErrors.data),
    });

    // 4. إذا كانت الاستجابة غير ناجحة
    if (!response.ok) {
      return {
        message:
          response.status === 401
            ? "Invalid email or password."
            : response.statusText || "An error occurred. Please try again.",
      };
    }

    // 5. في حالة النجاح: استخراج البيانات وإنشاء الـ Session
    const responseData = await response.json();

    await createSession({
      user: {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
      },
      accessToken: responseData.accessToken,
      refreshToken: responseData.refreshToken,
    });
  } catch (error) {
    // التعامل مع أخطاء السيرفر المغلق أو انقطاع الشبكة
    return {
      message: "Unable to connect to the server. Please try again later.",
    };
  }

  // 6. التوجيه بعد نجاح العملية (توضع في النهاية وخارج الـ try/catch)
  redirect("/");

}

export const refreshToken= async (oldRefreshToken: string) =>{
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: oldRefreshToken }),
    });
    if(!response.ok){
      return {
        message:
        response.status === 401
          ? "Invalid refresh token."
          : response.statusText || "An error occurred. Please try again.",
      };
    }
    const {accessToken, refreshToken} = await response.json();
    await updateToken({accessToken,refreshToken});
    return {accessToken};

  
    
  } catch (error) {
    console.log( "Error refreshing token:",error);
    return null;
  }
}