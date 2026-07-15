import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

async function getSettings() {
  let settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: {
        id: "singleton",
        storeName: "Luxe Nest Household",
        paymentMethods: ["MPESA"],
        paymentNotes: "",
        mpesaTillNumber: "",
        whatsappNumber: "254769567516",
        shippingZones: [
          { name: "Eldoret", rate: 200 },
          { name: "Upcountry", rate: 500 },
        ],
        freeShippingOver: null,
      },
    });
  }
  return settings;
}

export default async function SettingsPage() {
  const isAuth = await isAuthenticatedServer();
  if (!isAuth) redirect("/admin/login");

  const settings = await getSettings();
  return <SettingsClient initialSettings={settings} />;
}
