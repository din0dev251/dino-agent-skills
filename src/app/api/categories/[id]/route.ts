import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSheetValues, getSheetRowIndex, updateRow, deleteRow } from "@/lib/sheets";
import { SHEET_NAMES } from "@/types";

function findCategoryRowIndex(
  rows: (string | number)[][],
  id: string
): number | null {
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
    const rows = await getSheetValues(SHEET_NAMES.CATEGORIES);
    const sheetRow = findCategoryRowIndex(rows, id);
    if (!sheetRow) return NextResponse.json({ error: "Không tìm thấy category." }, { status: 404 });
    const [header, ...data] = rows;
    const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
    const rowIndex = sheetRow - 2;
    const current = data[rowIndex] as (string | number)[];
    const body = await req.json();
    const { name, order } = body as { name?: string; order?: number };
    const updated = [...current];
    if (name !== undefined) updated[h.name] = String(name).trim();
    if (order !== undefined) updated[h.order] = Number(order);
    await updateRow(SHEET_NAMES.CATEGORIES, sheetRow, updated);
    return NextResponse.json({ ok: true, message: "Đã cập nhật category." });
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
    const sheetRow = await getSheetRowIndex(SHEET_NAMES.CATEGORIES, "id", id);
    if (!sheetRow) return NextResponse.json({ error: "Không tìm thấy category." }, { status: 404 });
    await deleteRow(SHEET_NAMES.CATEGORIES, sheetRow);
    return NextResponse.json({ ok: true, message: "Đã xóa category." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi xóa." }, { status: 500 });
  }
}
