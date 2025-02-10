import { NextResponse } from "next/server";

// 用于存储唯一的追踪目标
let currentNode: { lat: number; lng: number; id: number } | null = null;

// 处理 POST 请求：更新目标的坐标
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { lat, lng } = body;

        if (lat === undefined || lng === undefined) {
            return NextResponse.json({ success: false, message: "Missing lat/lng" }, { status: 400 });
        }

        // 更新唯一的 `currentNode`
        currentNode = { lat, lng, id: 0 }; // ID 始终为 0，保持唯一性
        console.log("Updated current location:", currentNode);

        return NextResponse.json({ success: true, currentNode }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Invalid request. error: ", error }, { status: 500 });
    }
}

// 处理 GET 请求：获取唯一追踪目标的位置
export async function GET() {
    if (!currentNode) {
        return NextResponse.json({ success: false, message: "No target found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, currentNode }, { status: 200 });
}
