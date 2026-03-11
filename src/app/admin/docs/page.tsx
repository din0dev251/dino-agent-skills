"use client";

import { useState, useEffect } from "react";
import type { DocSection } from "@/types";
import { Loading } from "@/components/ui/Loading";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";

export default function AdminDocsPage() {
  const [sections, setSections] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<DocSection | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((d) => setSections(Array.isArray(d) ? d : []))
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setTitle("");
    setContent("");
    setModal("add");
    setError("");
  };

  const openEdit = (doc: DocSection) => {
    setEditing(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setModal("edit");
    setError("");
  };

  const save = async () => {
    if (!title.trim()) {
      setError("Tiêu đề là bắt buộc.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (modal === "add") {
        const res = await fetch("/api/docs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Lỗi");
        load();
        setModal(null);
      } else if (editing) {
        const res = await fetch("/api/docs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, title: title.trim(), content }),
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

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loading /></div>;

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-semibold text-white">Documentation</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Thêm mục
        </button>
      </div>

      <ul className="space-y-2">
        {sections.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-surface-card px-4 py-3"
          >
            <span className="text-white">{s.title}</span>
            <button
              type="button"
              onClick={() => openEdit(s)}
              className="text-accent hover:underline"
            >
              Sửa
            </button>
          </li>
        ))}
      </ul>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-white/10 bg-surface-card p-6">
            <h3 className="font-semibold text-white">
              {modal === "add" ? "Thêm mục docs" : "Sửa mục docs"}
            </h3>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <div className="mt-4 flex-1 space-y-3 overflow-auto">
              <div>
                <label className="block text-sm text-gray-400">Tiêu đề *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-white/10 bg-surface px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Nội dung (dùng nút bên dưới để chèn chữ đậm, nghiêng, link...)</label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Nhập nội dung Markdown..."
                  height={360}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
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
