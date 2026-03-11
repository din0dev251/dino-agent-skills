"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import type { Skill } from "@/types";
import type { Category } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function MyProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    links: [] as string[],
    skillIds: [] as string[],
  });
  const [newLink, setNewLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.replace("/login?callbackUrl=/my-projects");
      return;
    }
  }, [session, status, router]);

  const load = () => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]));
    fetch("/api/skills?limit=500")
      .then((r) => r.json())
      .then((d) => setSkills(d.items ?? []))
      .catch(() => setSkills([]));
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (session?.user?.id) load();
  }, [session?.user?.id]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", links: [], skillIds: [] });
    setNewLink("");
    setModal("add");
    setError("");
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      links: Array.isArray(p.links) ? [...p.links] : [],
      skillIds: Array.isArray(p.skillIds) ? [...p.skillIds] : [],
    });
    setNewLink("");
    setModal("edit");
    setError("");
  };

  const addLink = () => {
    if (!newLink.trim()) return;
    setForm((f) => ({ ...f, links: [...f.links, newLink.trim()] }));
    setNewLink("");
  };

  const removeLink = (index: number) => {
    setForm((f) => ({ ...f, links: f.links.filter((_, i) => i !== index) }));
  };

  const toggleSkill = (id: string) => {
    setForm((f) =>
      f.skillIds.includes(id)
        ? { ...f, skillIds: f.skillIds.filter((s) => s !== id) }
        : { ...f, skillIds: [...f.skillIds, id] }
    );
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError("Tên project là bắt buộc.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (modal === "add") {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Lỗi");
        load();
        setModal(null);
      } else if (editing) {
        const res = await fetch(`/api/projects/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Lỗi");
        load();
        setModal(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa project này?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  if (status === "loading" || !session?.user?.id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loading /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dự án của tôi</h1>
          <p className="mt-1 text-gray-400">
            Quản lý project và agent skills, link Git liên quan (riêng tư).
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Thêm project
        </button>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-surface-card p-8 text-center text-gray-500">
            Chưa có project nào. Bấm &quot;Thêm project&quot; để tạo.
          </p>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-white/10 bg-surface-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">{p.name}</h2>
                  {p.description && (
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.isArray(p.links) &&
                      p.links.slice(0, 3).map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline"
                        >
                          Link {i + 1}
                        </a>
                      ))}
                    {Array.isArray(p.links) && p.links.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{p.links.length - 3} link
                      </span>
                    )}
                  </div>
                  {Array.isArray(p.skillIds) && p.skillIds.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {p.skillIds.length} skill(s)
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="text-accent hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="text-red-400 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-8 w-full max-w-lg rounded-xl border border-white/10 bg-surface-card p-6">
            <h3 className="font-semibold text-white">
              {modal === "add" ? "Thêm project" : "Sửa project"}
            </h3>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-400">Tên project *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Links (Git, repo, ...)</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                    placeholder="https://..."
                    className="flex-1 rounded border border-white/10 bg-surface px-3 py-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="rounded bg-surface-hover px-3 py-2 text-sm text-white hover:bg-white/10"
                  >
                    Thêm
                  </button>
                </div>
                <ul className="mt-2 space-y-1">
                  {form.links.map((link, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-sm">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-accent hover:underline"
                      >
                        {link}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="shrink-0 text-red-400 hover:underline"
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="block text-sm text-gray-400">Agent skills (chọn từ marketplace)</label>
                <select
                  multiple
                  value={form.skillIds}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                    setForm((f) => ({ ...f, skillIds: opts }));
                  }}
                  className="mt-1 max-h-32 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                      {categories.find((c) => c.id === s.categoryId)?.name && (
                        <span className="text-gray-500">
                          {" "}
                          ({categories.find((c) => c.id === s.categoryId)?.name})
                        </span>
                      )}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Giữ Ctrl/Cmd để chọn nhiều.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-surface-hover"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
