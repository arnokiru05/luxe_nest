import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import { cookies } from "next/headers";
import { SettingsClient } from "./settings-client";

async function getSettings() {
  const cookieStore = await cookies();
  const secret = cookieStore.get("admin_secret")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/settings`, {
    headers: { "x-admin-secret": secret || "" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SettingsPage() {
  const isAuth = await isAuthenticatedServer();
  if (!isAuth) redirect("/admin/login");

  const settings = await getSettings();
  return <SettingsClient initialSettings={settings} />;
}
