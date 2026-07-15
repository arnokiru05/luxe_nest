import { put } from "@vercel/blob";
import { NextResponse, NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file") as File;
  // Optional: productId or draftId passed as a form field to namespace the blob path
  const productId = (form.get("productId") as string) || "drafts";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only jpeg, png, webp, and avif are allowed." },
      { status: 400 }
    );
  }

  try {
    // Build a deterministic, unique path: products/{productId}/{timestamp}-{safeName}
    const ext = file.name.split(".").pop() ?? "jpg";
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 40);
    const blobPath = `products/${productId}/${Date.now()}-${safeName}.${ext}`;

    const blob = await put(blobPath, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
