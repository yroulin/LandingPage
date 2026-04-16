import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const login = searchParams.get("login");
  const domain = searchParams.get("domain");

  if (!login || !domain) {
    return NextResponse.json(
      { error: "Missing login or domain" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://www.1secmail.com/api/v1/?action=getMessages&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
