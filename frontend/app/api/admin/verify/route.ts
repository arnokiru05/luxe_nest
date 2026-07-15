import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    if (secret === process.env.ADMIN_SECRET && !!process.env.ADMIN_SECRET) {
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: "admin_secret",
        value: secret,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 86400 * 30, // 1 month
      });
      return response;
    }
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
