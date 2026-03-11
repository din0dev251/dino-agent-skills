"use client";

import { useState, useEffect } from "react";
import type { Resource } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function TuLieuQuyPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Tư liệu quý</h1>
      <p className="mt-1 text-gray-400">
        Tổng hợp link tài liệu để cải thiện kỹ năng
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">
          Chưa có tư liệu nào. Admin có thể thêm trong khu vực Admin.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {items.map((r) => (
            <li key={r.id}>
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-white/10 bg-surface-card p-4 transition hover:border-accent/50 hover:bg-surface-hover"
              >
                <h2 className="font-semibold text-white">{r.title}</h2>
                {r.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                    {r.description}
                  </p>
                )}
                <span className="mt-2 inline-block text-sm text-accent">
                  Mở link →
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
