import { NextResponse } from "next/server";

// Used to store the unique tracking target
let currentNode: { lat: number; lng: number; id: number } | null = null;

// Handle POST request: update the target's coordinates
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { lat, lng } = body;

        if (lat === undefined || lng === undefined) {
            return NextResponse.json({ success: false, message: "Missing lat/lng" }, { status: 400 });
        }

        // Update the unique `currentNode`
        currentNode = { lat, lng, id: 0 }; // ID is always 0 to maintain uniqueness
        console.log("Updated current location:", currentNode);

        return NextResponse.json({ success: true, currentNode }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Invalid request. error: ", error }, { status: 500 });
    }
}

// Handle GET request: get the location of the unique tracking target
export async function GET() {
    if (!currentNode) {
        return NextResponse.json({ success: false, message: "No target found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, currentNode }, { status: 200 });
}


