import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("session");

  // إرجاع رابط كامل مأخوذ من Request Origin
  return NextResponse.redirect(new URL("/auth/signin", req.url));
}