import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export function getAdminSecretFromRequest(req: NextRequest) {
  // First check header
  let secret = req.headers.get("x-admin-secret");
  if (secret) return secret;

  // Then check cookies (for Next.js App Router server actions/pages)
  const cookieSecret = req.cookies.get("admin_secret")?.value;
  if (cookieSecret) return cookieSecret;

  return null;
}

export function isAuthenticated(req: NextRequest) {
  const secret = getAdminSecretFromRequest(req);
  return secret === process.env.ADMIN_SECRET && !!process.env.ADMIN_SECRET;
}

export async function isAuthenticatedServer() {
  const cookieStore = await cookies();
  const secret = cookieStore.get("admin_secret")?.value;
  return secret === process.env.ADMIN_SECRET && !!process.env.ADMIN_SECRET;
}
