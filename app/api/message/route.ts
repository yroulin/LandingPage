import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const login = searchParams.get("login");
  const domain = searchParams.get("domain");
  const id = searchParams.get("id");

  if (!login || !domain || !id) {
    return NextResponse.json(
      { error: "Missing login, domain, or id" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://www.1secmail.com/api/v1/?action=readMessage&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}&id=${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to fetch message");
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}
