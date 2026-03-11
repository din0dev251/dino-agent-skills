import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSheetValues, getSheetRowIndex, updateRow, deleteRow } from "@/lib/sheets";
import { SHEET_NAMES } from "@/types";
import type { Skill } from "@/types";

const SKILL_HEADER = [
  "id",
  "title",
  "description",
  "categoryId",
  "link",
  "starCount",
  "createdAt",
  "updatedAt",
];

function parseSkillRow(rows: (string | number)[][], id: string): Skill | null {
  if (rows.length < 2) return null;
  const [header, ...data] = rows;
  const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
  const row = data.find((r) => String(r[h.id]) === id);
  if (!row) return null;
  return {
    id: String(row[h.id] ?? ""),
    title: String(row[h.title] ?? ""),
    description: String(row[h.description] ?? ""),
    categoryId: String(row[h.categoryId] ?? ""),
    link: row[h.link] ? String(row[h.link]) : undefined,
    starCount: Number(row[h.starCount]) || 0,
    createdAt: String(row[h.createdAt] ?? ""),
    updatedAt: String(row[h.updatedAt] ?? ""),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await getSheetValues(SHEET_NAMES.SKILLS);
    const skill = parseSkillRow(rows, id);
    if (!skill) return NextResponse.json({ error: "Không tìm thấy skill." }, { status: 404 });
    return NextResponse.json(skill);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi." }, { status: 500 });
  }
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
    const rows = await getSheetValues(SHEET_NAMES.SKILLS);
    const [header, ...data] = rows;
    const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
    const rowIndex = data.findIndex((r) => String(r[h.id]) === id);
    if (rowIndex < 0) return NextResponse.json({ error: "Không tìm thấy skill." }, { status: 404 });
    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      link,
    } = body as { title?: string; description?: string; categoryId?: string; link?: string };
    const current = data[rowIndex] as (string | number)[];
    const updated = [...current];
    if (title !== undefined) updated[h.title] = String(title).trim();
    if (description !== undefined) updated[h.description] = String(description).trim();
    if (categoryId !== undefined) updated[h.categoryId] = String(categoryId).trim();
    if (link !== undefined) updated[h.link] = String(link).trim();
    updated[h.updatedAt] = new Date().toISOString();
    const sheetRow = rowIndex + 2;
    await updateRow(SHEET_NAMES.SKILLS, sheetRow, updated);
    return NextResponse.json({ ok: true, message: "Đã cập nhật skill." });
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
    const sheetRow = await getSheetRowIndex(SHEET_NAMES.SKILLS, "id", id);
    if (!sheetRow) return NextResponse.json({ error: "Không tìm thấy skill." }, { status: 404 });
    await deleteRow(SHEET_NAMES.SKILLS, sheetRow);
    return NextResponse.json({ ok: true, message: "Đã xóa skill." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi xóa." }, { status: 500 });
  }
}
