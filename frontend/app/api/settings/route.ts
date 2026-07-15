import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function getOrCreateSettings() {
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

// Public — checkout page fetches till number & WA number without auth
export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await getOrCreateSettings(); // ensure it exists
    const data = await request.json();
    const updated = await prisma.storeSettings.update({
      where: { id: "singleton" },
      data,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
