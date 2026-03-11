import { getSheetValues } from "./sheets";
import { SHEET_NAMES } from "@/types";
import bcrypt from "bcryptjs";
import type { User as AuthUser } from "next-auth";
import type { User } from "@/types";

const USER_KEYS = ["id", "email", "passwordHash", "role", "createdAt"] as const;

export async function findUserByEmail(email: string): Promise<User | null> {
  const rows = await getSheetValues(SHEET_NAMES.USERS);
  if (rows.length < 2) return null;
  const [header, ...dataRows] = rows;
  const emailCol = (header as string[]).indexOf("email");
  if (emailCol < 0) return null;
  const row = dataRows.find((r) => (r[emailCol] as string)?.toLowerCase() === email.toLowerCase());
  if (!row) return null;
  const idCol = (header as string[]).indexOf("id");
  const roleCol = (header as string[]).indexOf("role");
  const createdAtCol = (header as string[]).indexOf("createdAt");
  return {
    id: String(row[idCol] ?? ""),
    email: String(row[emailCol] ?? ""),
    role: (row[roleCol] as User["role"]) ?? "user",
    createdAt: String(row[createdAtCol] ?? ""),
  };
}

export async function verifyPassword(
  email: string,
  password: string
): Promise<User | null> {
  const rows = await getSheetValues(SHEET_NAMES.USERS);
  if (rows.length < 2) return null;
  const [header, ...dataRows] = rows;
  const cols = (header as string[]).reduce(
    (acc, h, i) => ({ ...acc, [h]: i }),
    {} as Record<string, number>
  );
  const row = dataRows.find(
    (r) => (r[cols["email"]] as string)?.toLowerCase() === email.toLowerCase()
  );
  if (!row) return null;
  const hash = row[cols["passwordHash"]] as string;
  if (!hash || !(await bcrypt.compare(password, hash))) return null;
  return {
    id: String(row[cols["id"]] ?? ""),
    email: String(row[cols["email"]] ?? ""),
    role: (row[cols["role"]] as User["role"]) ?? "user",
    createdAt: String(row[cols["createdAt"]] ?? ""),
  };
}

export function userToSession(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
