import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getSheetValues, getSheetRowIndex, updateRow, deleteRow } from "@/lib/sheets";
import { authOptions } from "@/lib/auth-options";
import { SHEET_NAMES } from "@/types";

function findRow(rows: (string | number)[][], id: string): number | null {
  if (rows.length < 2) return null;
  const [header, ...data] = rows;
  const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
  const i = data.findIndex((r) => String(r[h.id]) === id);
  return i >= 0 ? i + 2 : null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Cần quyền admin." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const rows = await getSheetValues(SHEET_NAMES.RESOURCES);
    const sheetRow = findRow(rows, id);
    if (!sheetRow) return NextResponse.json({ error: "Không tìm thấy." }, { status: 404 });
    const [header, ...data] = rows;
    const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
    const current = data[sheetRow - 2] as (string | number)[];
    const body = await req.json();
    const { title, description, link, order } = body as {
      title?: string;
      description?: string;
      link?: string;
      order?: number;
    };
    const updated = [...current];
    if (title !== undefined) updated[h.title] = String(title).trim();
    if (description !== undefined) updated[h.description] = String(description).trim();
    if (link !== undefined) updated[h.link] = String(link).trim();
    if (order !== undefined) updated[h.order] = Number(order);
    await updateRow(SHEET_NAMES.RESOURCES, sheetRow, updated);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi cập nhật." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Cần quyền admin." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const sheetRow = await getSheetRowIndex(SHEET_NAMES.RESOURCES, "id", id);
    if (!sheetRow) return NextResponse.json({ error: "Không tìm thấy." }, { status: 404 });
    await deleteRow(SHEET_NAMES.RESOURCES, sheetRow);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi xóa." }, { status: 500 });
  }
}
