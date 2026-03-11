"use client";

import { useState, useEffect } from "react";
import type { Resource } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function AdminResourcesPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState({ title: "", description: "", link: "", order: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", description: "", link: "", order: items.length });
    setModal("add");
    setError("");
  };

  const openEdit = (r: Resource) => {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description,
      link: r.link,
      order: r.order,
    });
    setModal("edit");
    setError("");
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("Tiêu đề là bắt buộc.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (modal === "add") {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Lỗi");
        load();
        setModal(null);
      } else if (editing) {
        const res = await fetch(`/api/resources/${editing.id}`, {
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
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loading /></div>;

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-semibold text-white">Tư liệu quý</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Thêm tư liệu
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-white/10">
          <thead>
            <tr className="bg-surface-card">
              <th className="border border-white/10 px-3 py-2 text-left text-sm text-gray-400">Tiêu đề</th>
              <th className="border border-white/10 px-3 py-2 text-left text-sm text-gray-400">Link</th>
              <th className="border border-white/10 px-3 py-2 text-right text-sm text-gray-400">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border border-white/10">
                <td className="border border-white/10 px-3 py-2 text-white">{r.title}</td>
                <td className="max-w-[200px] truncate border border-white/10 px-3 py-2 text-sm text-gray-400">
                  <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {r.link || "—"}
                  </a>
                </td>
                <td className="border border-white/10 px-3 py-2 text-right">
                  <button type="button" onClick={() => openEdit(r)} className="mr-2 text-accent hover:underline">Sửa</button>
                  <button type="button" onClick={() => remove(r.id)} className="text-red-400 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-surface-card p-6">
            <h3 className="font-semibold text-white">{modal === "add" ? "Thêm tư liệu" : "Sửa tư liệu"}</h3>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-400">Tiêu đề *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
                <label className="block text-sm text-gray-400">Link</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Thứ tự</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setModal(null)} className="rounded border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-surface-hover">Hủy</button>
              <button type="button" onClick={save} disabled={saving} className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover disabled:opacity-50">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
