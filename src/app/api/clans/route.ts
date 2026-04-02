import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = `https://ninjasaga.cc/data/clan_rankings.json?t=${Date.now()}`;
    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: {
        "User-Agent": "NinjaSaga-CW-Tracker/1.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch clan data" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Clan API proxy error:", err);
    return NextResponse.json(
      { error: "Internal error fetching clan data" },
      { status: 500 }
    );
  }
}
