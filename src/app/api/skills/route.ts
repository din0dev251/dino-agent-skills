import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSheetValues, appendRow, getSheetRowIndex, updateRow } from "@/lib/sheets";
import { SHEET_NAMES } from "@/types";
import type { Skill } from "@/types";
import { v4 as uuidv4 } from "uuid";

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

function parseSkills(rows: (string | number)[][]): Skill[] {
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = (header as string[]).reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Record<string, number>);
  return data.map((row) => ({
    id: String(row[h.id] ?? ""),
    title: String(row[h.title] ?? ""),
    description: String(row[h.description] ?? ""),
    categoryId: String(row[h.categoryId] ?? ""),
    link: row[h.link] ? String(row[h.link]) : undefined,
    starCount: Number(row[h.starCount]) || 0,
    createdAt: String(row[h.createdAt] ?? ""),
    updatedAt: String(row[h.updatedAt] ?? ""),
  }));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const categoryId = searchParams.get("categoryId")?.trim() || "";
    const sort = searchParams.get("sort") || "popular"; // popular | newest
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(10, parseInt(searchParams.get("limit") || "12", 10)));
    const rows = await getSheetValues(SHEET_NAMES.SKILLS);
    let skills = parseSkills(rows);
    if (q) {
      const lower = q.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.title.toLowerCase().includes(lower) ||
          s.description.toLowerCase().includes(lower)
      );
    }
    if (categoryId) {
      skills = skills.filter((s) => s.categoryId === categoryId);
    }
    if (sort === "newest") {
      skills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      skills.sort((a, b) => b.starCount - a.starCount);
    }
    const total = skills.length;
    const start = (page - 1) * limit;
    const items = skills.slice(start, start + limit);
    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi tải skills." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Cần quyền admin." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      link,
    } = body as { title?: string; description?: string; categoryId?: string; link?: string };
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title là bắt buộc." }, { status: 400 });
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    await appendRow(SHEET_NAMES.SKILLS, [
      id,
      title.trim(),
      (description ?? "").trim(),
      (categoryId ?? "").trim(),
      (link ?? "").trim(),
      0,
      now,
      now,
    ]);
    return NextResponse.json({
      ok: true,
      id,
      message: "Đã thêm skill.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi thêm skill." }, { status: 500 });
  }
}
