import { NextRequest, NextResponse } from "next/server";
import { getSheetValues, updateRow } from "@/lib/sheets";
import { SHEET_NAMES } from "@/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await getSheetValues(SHEET_NAMES.SKILLS);
    if (rows.length < 2) return NextResponse.json({ error: "Không tìm thấy skill." }, { status: 404 });
    const [header, ...data] = rows;
    const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
    const rowIndex = data.findIndex((r) => String(r[h.id]) === id);
    if (rowIndex < 0) return NextResponse.json({ error: "Không tìm thấy skill." }, { status: 404 });
    const row = data[rowIndex] as (string | number)[];
    const starCount = (Number(row[h.starCount]) || 0) + 1;
    const updated = [...row];
    updated[h.starCount] = starCount;
    updated[h.updatedAt] = new Date().toISOString();
    const sheetRow = rowIndex + 2;
    await updateRow(SHEET_NAMES.SKILLS, sheetRow, updated);
    return NextResponse.json({ ok: true, starCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi." }, { status: 500 });
  }
}
