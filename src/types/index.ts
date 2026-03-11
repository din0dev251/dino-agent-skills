export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  link?: string;
  starCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  links: string[];
  skillIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
  order: number;
  createdAt: string;
}

export const SHEET_NAMES = {
  USERS: "users",
  CATEGORIES: "categories",
  SKILLS: "skills",
  PROJECTS: "projects",
  DOCS: "docs",
  RESOURCES: "resources",
} as const;
