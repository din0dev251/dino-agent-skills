import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSheetValues, getSheetRowIndex, updateRow, deleteRow } from "@/lib/sheets";
import { SHEET_NAMES } from "@/types";

function findProjectRow(
  rows: (string | number)[][],
  id: string,
  userId: string
): { rowIndex: number; sheetRow: number } | null {
  if (rows.length < 2) return null;
  const [header, ...data] = rows;
  const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
  const rowIndex = data.findIndex(
    (r) => String(r[h.id]) === id && String(r[h.userId]) === userId
  );
  if (rowIndex < 0) return null;
  return { rowIndex, sheetRow: rowIndex + 2 };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const rows = await getSheetValues(SHEET_NAMES.PROJECTS);
    const [header, ...data] = rows;
    const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
    const row = data.find((r) => String(r[h.id]) === id && String(r[h.userId]) === session.user.id);
    if (!row) return NextResponse.json({ error: "Không tìm thấy project." }, { status: 404 });
    const linksRaw = row[h.links];
    const skillIdsRaw = row[h.skillIds];
    return NextResponse.json({
      id: String(row[h.id]),
      userId: String(row[h.userId]),
      name: String(row[h.name]),
      description: String(row[h.description]),
      links: typeof linksRaw === "string" ? (() => { try { return JSON.parse(linksRaw); } catch { return []; } })() : (Array.isArray(linksRaw) ? linksRaw : []),
      skillIds: typeof skillIdsRaw === "string" ? (() => { try { return JSON.parse(skillIdsRaw); } catch { return []; } })() : (Array.isArray(skillIdsRaw) ? skillIdsRaw : []),
      createdAt: String(row[h.createdAt]),
      updatedAt: String(row[h.updatedAt]),
    });
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const rows = await getSheetValues(SHEET_NAMES.PROJECTS);
    const found = findProjectRow(rows, id, session.user.id);
    if (!found) return NextResponse.json({ error: "Không tìm thấy project." }, { status: 404 });
    const [header, ...data] = rows;
    const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
    const current = data[found.rowIndex] as (string | number)[];
    const body = await req.json();
    const { name, description, links, skillIds } = body as {
      name?: string;
      description?: string;
      links?: string[];
      skillIds?: string[];
    };
    const updated = [...current];
    const now = new Date().toISOString();
    if (name !== undefined) updated[h.name] = String(name).trim();
    if (description !== undefined) updated[h.description] = String(description).trim();
    if (links !== undefined) updated[h.links] = JSON.stringify(Array.isArray(links) ? links : []);
    if (skillIds !== undefined) updated[h.skillIds] = JSON.stringify(Array.isArray(skillIds) ? skillIds : []);
    updated[h.updatedAt] = now;
    await updateRow(SHEET_NAMES.PROJECTS, found.sheetRow, updated);
    return NextResponse.json({ ok: true, message: "Đã cập nhật project." });
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const rows = await getSheetValues(SHEET_NAMES.PROJECTS);
    const found = findProjectRow(rows, id, session.user.id);
    if (!found) return NextResponse.json({ error: "Không tìm thấy project." }, { status: 404 });
    await deleteRow(SHEET_NAMES.PROJECTS, found.sheetRow);
    return NextResponse.json({ ok: true, message: "Đã xóa project." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi xóa." }, { status: 500 });
  }
}
