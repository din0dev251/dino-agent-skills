import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSheetValues, appendRow, getSheetRowIndex, updateRow } from "@/lib/sheets";
import { SHEET_NAMES } from "@/types";
import type { DocSection } from "@/types";
import { v4 as uuidv4 } from "uuid";

function parseDocs(rows: (string | number)[][]): DocSection[] {
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
  return data.map((row) => ({
    id: String(row[h.id] ?? ""),
    title: String(row[h.title] ?? ""),
    content: String(row[h.content] ?? ""),
    updatedAt: String(row[h.updatedAt] ?? ""),
  }));
}

export async function GET() {
  try {
    const rows = await getSheetValues(SHEET_NAMES.DOCS);
    const docs = parseDocs(rows);
    return NextResponse.json(docs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi tải docs." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Cần quyền admin." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { title, content } = body as { title?: string; content?: string };
    if (!title?.trim()) {
      return NextResponse.json({ error: "Tiêu đề là bắt buộc." }, { status: 400 });
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    await appendRow(SHEET_NAMES.DOCS, [id, title.trim(), content ?? "", now]);
    return NextResponse.json({ ok: true, id, message: "Đã thêm mục docs." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi thêm docs." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Cần quyền admin." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { id, title, content } = body as { id: string; title?: string; content?: string };
    if (!id) return NextResponse.json({ error: "Thiếu id." }, { status: 400 });
    const rows = await getSheetValues(SHEET_NAMES.DOCS);
    const [header, ...data] = rows;
    const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
    const rowIndex = data.findIndex((r) => String(r[h.id]) === id);
    if (rowIndex < 0) return NextResponse.json({ error: "Không tìm thấy mục docs." }, { status: 404 });
    const current = data[rowIndex] as (string | number)[];
    const updated = [...current];
    const now = new Date().toISOString();
    if (title !== undefined) updated[h.title] = String(title).trim();
    if (content !== undefined) updated[h.content] = String(content);
    updated[h.updatedAt] = now;
    await updateRow(SHEET_NAMES.DOCS, rowIndex + 2, updated);
    return NextResponse.json({ ok: true, message: "Đã cập nhật docs." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi cập nhật docs." }, { status: 500 });
  }
}
