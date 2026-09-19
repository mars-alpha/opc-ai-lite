import { NextResponse } from "next/server";
import { listPublishedContentItems } from "../../../../lib/server/content/reader";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ items: await listPublishedContentItems() });
  } catch (error) {
    console.error("[OPC AI] published content API failed", error);
    return NextResponse.json({ error: "CONTENT_READ_FAILED" }, { status: 500 });
  }
}


