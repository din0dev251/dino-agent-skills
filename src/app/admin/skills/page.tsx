"use client";

import { useState, useEffect } from "react";
import type { Skill } from "@/types";
import type { Category } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "", link: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/skills?limit=100")
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
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", description: "", categoryId: categories[0]?.id ?? "", link: "" });
    setModal("add");
    setError("");
  };

  const openEdit = (skill: Skill) => {
    setEditing(skill);
    setForm({
      title: skill.title,
      description: skill.description,
      categoryId: skill.categoryId,
      link: skill.link ?? "",
    });
    setModal("edit");
    setError("");
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("Title là bắt buộc.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (modal === "add") {
        const res = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Lỗi");
        load();
        setModal(null);
      } else if (editing) {
        const res = await fetch(`/api/skills/${editing.id}`, {
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
    if (!confirm("Bạn chắc chắn muốn xóa skill này?")) return;
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loading /></div>;

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-semibold text-white">Skills</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Thêm skill
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-white/10">
          <thead>
            <tr className="bg-surface-card">
              <th className="border border-white/10 px-3 py-2 text-left text-sm text-gray-400">Title</th>
              <th className="border border-white/10 px-3 py-2 text-left text-sm text-gray-400">Category</th>
              <th className="border border-white/10 px-3 py-2 text-left text-sm text-gray-400">Stars</th>
              <th className="border border-white/10 px-3 py-2 text-right text-sm text-gray-400">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id} className="border border-white/10">
                <td className="border border-white/10 px-3 py-2 text-white">{s.title}</td>
                <td className="border border-white/10 px-3 py-2 text-gray-400">
                  {categories.find((c) => c.id === s.categoryId)?.name ?? (s.categoryId || "—")}
                </td>
                <td className="border border-white/10 px-3 py-2 text-gray-400">{s.starCount}</td>
                <td className="border border-white/10 px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="mr-2 text-accent hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    className="text-red-400 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-surface-card p-6">
            <h3 className="font-semibold text-white">
              {modal === "add" ? "Thêm skill" : "Sửa skill"}
            </h3>
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-400">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400">Link (repo/docs)</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
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
