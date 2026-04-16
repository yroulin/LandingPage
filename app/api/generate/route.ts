import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to generate email");
    const data: string[] = await res.json();
    const [login, domain] = data[0].split("@");
    return NextResponse.json({ email: data[0], login, domain });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate email address" },
      { status: 500 }
    );
  }
}
