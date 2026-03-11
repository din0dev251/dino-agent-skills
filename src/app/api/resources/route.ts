import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getSheetValues, appendRow } from "@/lib/sheets";
import { authOptions } from "@/lib/auth-options";
import { SHEET_NAMES } from "@/types";
import type { Resource } from "@/types";
import { v4 as uuidv4 } from "uuid";

function parseResources(rows: (string | number)[][]): Resource[] {
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
  return data
    .map((row) => ({
      id: String(row[h.id] ?? ""),
      title: String(row[h.title] ?? ""),
      description: String(row[h.description] ?? ""),
      link: String(row[h.link] ?? ""),
      order: Number(row[h.order]) || 0,
      createdAt: String(row[h.createdAt] ?? ""),
    }))
    .sort((a, b) => a.order - b.order);
}

export async function GET() {
  try {
    const rows = await getSheetValues(SHEET_NAMES.RESOURCES);
    const items = parseResources(rows);
    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi tải tư liệu." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Cần quyền admin." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { title, description, link, order } = body as {
      title?: string;
      description?: string;
      link?: string;
      order?: number;
    };
    if (!title?.trim()) {
      return NextResponse.json({ error: "Tiêu đề là bắt buộc." }, { status: 400 });
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    const rows = await getSheetValues(SHEET_NAMES.RESOURCES);
    const nextOrder = typeof order === "number" ? order : Math.max(0, rows.length - 1);
    await appendRow(SHEET_NAMES.RESOURCES, [
      id,
      title.trim(),
      (description ?? "").trim(),
      (link ?? "").trim(),
      nextOrder,
      now,
    ]);
    return NextResponse.json({ ok: true, id, message: "Đã thêm tư liệu." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi thêm tư liệu." }, { status: 500 });
  }
}
