"use client";

import { useState, useEffect } from "react";
import type { DocSection } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function DocumentationPage() {
  const [sections, setSections] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((list) => {
        setSections(Array.isArray(list) ? list : []);
        if (list?.length) setActiveId(list[0].id);
      })
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  const active = sections.find((s) => s.id === activeId);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Documentation</h1>
      <p className="mt-1 text-gray-400">
        Tài liệu về Agent Skill và các mẫu SKILL.md
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 shrink-0">
          <nav className="sticky top-20 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeId === s.id
                    ? "bg-accent text-white"
                    : "text-gray-400 hover:bg-surface-hover hover:text-white"
                }`}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          {active ? (
            <article className="prose prose-invert max-w-none rounded-xl border border-white/10 bg-surface-card p-6">
              <h2 className="text-xl font-semibold text-white">{active.title}</h2>
              <div
                className="mt-4 whitespace-pre-wrap text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: active.content
                    .replace(/\n/g, "<br />")
                    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="my-4 overflow-x-auto rounded bg-black/30 p-4 text-sm"><code>$2</code></pre>')
                    .replace(/`([^`]+)`/g, "<code class='rounded bg-white/10 px-1'>$1</code>")
                    .replace(/^### (.*)$/gm, "<h3 class='mt-4 font-semibold'>$1</h3>")
                    .replace(/^## (.*)$/gm, "<h2 class='mt-6 font-semibold'>$1</h2>")
                    .replace(/^# (.*)$/gm, "<h1 class='font-bold'>$1</h1>")
                    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener">$1</a>'),
                }}
              />
            </article>
          ) : sections.length === 0 ? (
            <p className="text-gray-500">Chưa có nội dung documentation. Admin có thể thêm trong khu vực Admin.</p>
          ) : (
            <p className="text-gray-500">Chọn một mục bên trái.</p>
          )}
        </div>
      </div>
    </div>
  );
}
