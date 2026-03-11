import { NextRequest, NextResponse } from "next/server";
import { getSheetValues, appendRow } from "@/lib/sheets";
import { hashPassword } from "@/lib/auth";
import { findUserByEmail } from "@/lib/auth";
import { SHEET_NAMES } from "@/types";
import { v4 as uuidv4 } from "uuid";

const USER_HEADER = ["id", "email", "passwordHash", "role", "createdAt"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email và mật khẩu (tối thiểu 6 ký tự) là bắt buộc." },
        { status: 400 }
      );
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email đã được đăng ký." },
        { status: 400 }
      );
    }
    const id = uuidv4();
    const passwordHash = await hashPassword(password);
    const createdAt = new Date().toISOString();
    const role = "user";
    appendRow(SHEET_NAMES.USERS, [
      id,
      email.trim().toLowerCase(),
      passwordHash,
      role,
      createdAt,
    ]);
    return NextResponse.json({
      ok: true,
      message: "Đăng ký thành công. Bạn có thể đăng nhập.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Lỗi đăng ký." },
      { status: 500 }
    );
  }
}
