import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

// Handles GET /api/download
export async function GET() {
  try {
    const snapshot = await db.ref("nodes").once("value");
    const nodes = snapshot.val() || {};

    const formatted = Object.keys(nodes).map((key) => ({
      id: key,
      ...nodes[key],
    }));

    // Force download as a JSON file
    return new NextResponse(JSON.stringify(formatted, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=nodes.json",
      },
    });
  } catch (err: any) {
    console.error("Error downloading data:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
