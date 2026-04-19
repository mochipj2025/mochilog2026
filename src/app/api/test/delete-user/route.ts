import { NextResponse } from "next/server";
import { deleteUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await deleteUser(email);

    return NextResponse.json({ success: true, message: `User ${email} deleted.` });
  } catch (error: any) {
    console.error("Delete user API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
