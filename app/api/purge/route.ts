import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

// DELETE /api/purge → clears the "nodes" collection
export async function DELETE() {
  try {
    await db.ref("nodes").remove(); // deletes all child data

    return NextResponse.json({ success: true, message: "Database purged." });
  } catch (err: any) {
    console.error("Error purging data:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
