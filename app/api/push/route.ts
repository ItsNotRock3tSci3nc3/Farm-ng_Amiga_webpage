import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const ref = await db.ref("nodes").push({
      ...data,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: ref.key });
  } catch (err: any) {
    console.error("Error writing to Realtime DB:", err);
    return NextResponse.json({ error: err.message, code: err.code ?? "UNKNOWN" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snapshot = await db.ref("nodes").once("value");

    if (!snapshot.exists()) {
      return NextResponse.json({ nodes: [] }); // empty list if no data
    }

    const data = snapshot.val();
    // snapshot.val() is an object keyed by push IDs; convert to array
    const nodes = Object.entries(data).map(([id, value]) => ({
      id,
      ...(value as object),
    }));

    return NextResponse.json({ nodes });
  } catch (err: any) {
    console.error("Error reading from Realtime DB:", err);
    return NextResponse.json(
      { error: err.message, code: err.code ?? "UNKNOWN" },
      { status: 500 }
    );
  }
}
