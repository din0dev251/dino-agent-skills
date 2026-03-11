"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
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
    setName("");
    setOrder(categories.length);
    setModal("add");
    setError("");
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setOrder(cat.order);
    setModal("edit");
    setError("");
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Tên category là bắt buộc.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (modal === "add") {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), order }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Lỗi");
        load();
        setModal(null);
      } else if (editing) {
        const res = await fetch(`/api/categories/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), order }),
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
    if (!confirm("Bạn chắc chắn muốn xóa category này?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loading /></div>;

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-semibold text-white">Categories</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Thêm category
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-white/10">
          <thead>
            <tr className="bg-surface-card">
              <th className="border border-white/10 px-3 py-2 text-left text-sm text-gray-400">Tên</th>
              <th className="border border-white/10 px-3 py-2 text-left text-sm text-gray-400">Thứ tự</th>
              <th className="border border-white/10 px-3 py-2 text-right text-sm text-gray-400">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border border-white/10">
                <td className="border border-white/10 px-3 py-2 text-white">{c.name}</td>
                <td className="border border-white/10 px-3 py-2 text-gray-400">{c.order}</td>
                <td className="border border-white/10 px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="mr-2 text-accent hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
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
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-surface-card p-6">
            <h3 className="font-semibold text-white">
              {modal === "add" ? "Thêm category" : "Sửa category"}
            </h3>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-400">Tên *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Thứ tự</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
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
