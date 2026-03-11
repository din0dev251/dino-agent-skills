import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSheetValues, appendRow } from "@/lib/sheets";
import { SHEET_NAMES } from "@/types";
import type { Project } from "@/types";
import { v4 as uuidv4 } from "uuid";

function parseProjects(rows: (string | number)[][], userId?: string): Project[] {
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
  let list = data.map((row) => {
    const linksRaw = row[h.links];
    const skillIdsRaw = row[h.skillIds];
    return {
      id: String(row[h.id] ?? ""),
      userId: String(row[h.userId] ?? ""),
      name: String(row[h.name] ?? ""),
      description: String(row[h.description] ?? ""),
      links: typeof linksRaw === "string" ? (() => { try { return JSON.parse(linksRaw); } catch { return []; } })() : (Array.isArray(linksRaw) ? linksRaw : []),
      skillIds: typeof skillIdsRaw === "string" ? (() => { try { return JSON.parse(skillIdsRaw); } catch { return []; } })() : (Array.isArray(skillIdsRaw) ? skillIdsRaw : []),
      createdAt: String(row[h.createdAt] ?? ""),
      updatedAt: String(row[h.updatedAt] ?? ""),
    };
  });
  if (userId) list = list.filter((p) => p.userId === userId);
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  }
  try {
    const rows = await getSheetValues(SHEET_NAMES.PROJECTS);
    const projects = parseProjects(rows, session.user.id);
    return NextResponse.json(projects);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi tải projects." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, description, links, skillIds } = body as {
      name?: string;
      description?: string;
      links?: string[];
      skillIds?: string[];
    };
    if (!name?.trim()) {
      return NextResponse.json({ error: "Tên project là bắt buộc." }, { status: 400 });
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    const linkArr = Array.isArray(links) ? links : [];
    const skillArr = Array.isArray(skillIds) ? skillIds : [];
    await appendRow(SHEET_NAMES.PROJECTS, [
      id,
      session.user.id,
      name.trim(),
      (description ?? "").trim(),
      JSON.stringify(linkArr),
      JSON.stringify(skillArr),
      now,
      now,
    ]);
    return NextResponse.json({ ok: true, id, message: "Đã thêm project." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi thêm project." }, { status: 500 });
  }
}
