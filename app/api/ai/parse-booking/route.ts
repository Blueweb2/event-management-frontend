import { NextRequest, NextResponse } from "next/server";
import { parseBookingVoiceText } from "@/lib/ai-booking-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { success: false, message: "A non-empty transcript text is required." },
        { status: 400 }
      );
    }

    const result = await parseBookingVoiceText(transcript);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error parsing booking voice note:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to parse booking voice note.",
      },
      { status: 500 }
    );
  }
}
