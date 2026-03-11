import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSheetValues, appendRow, getSheetRowIndex, updateRow, deleteRow } from "@/lib/sheets";
import { SHEET_NAMES } from "@/types";
import type { Category } from "@/types";
import { v4 as uuidv4 } from "uuid";

function parseCategories(rows: (string | number)[][]): Category[] {
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
  return data
    .map((row) => ({
      id: String(row[h.id] ?? ""),
      name: String(row[h.name] ?? ""),
      order: Number(row[h.order]) || 0,
    }))
    .sort((a, b) => a.order - b.order);
}

export async function GET() {
  try {
    const rows = await getSheetValues(SHEET_NAMES.CATEGORIES);
    const categories = parseCategories(rows);
    return NextResponse.json(categories);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi tải categories." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Cần quyền admin." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { name, order } = body as { name?: string; order?: number };
    if (!name?.trim()) {
      return NextResponse.json({ error: "Tên category là bắt buộc." }, { status: 400 });
    }
    const id = uuidv4();
    const rows = await getSheetValues(SHEET_NAMES.CATEGORIES);
    const nextOrder = typeof order === "number" ? order : (rows.length - 1) || 0;
    await appendRow(SHEET_NAMES.CATEGORIES, [id, name.trim(), nextOrder]);
    return NextResponse.json({ ok: true, id, message: "Đã thêm category." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi thêm category." }, { status: 500 });
  }
}
