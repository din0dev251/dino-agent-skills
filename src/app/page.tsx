"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/skills/SearchBar";
import { CategoryFilter } from "@/components/skills/CategoryFilter";
import { SkillCard } from "@/components/skills/SkillCard";
import { Loading } from "@/components/ui/Loading";
import type { Skill } from "@/types";
import type { Category } from "@/types";

type SortType = "popular" | "newest";

export default function MarketplacePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState<SortType>("popular");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 12;

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoryId) params.set("categoryId", categoryId);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(limit));
    const res = await fetch(`/api/skills?${params}`);
    const data = await res.json();
    if (res.ok) {
      setSkills(data.items ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }, [query, categoryId, sort, page]);

  useEffect(() => {
    fetch(`/api/categories`)
      .then((r) => r.json())
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Browse Skills</h1>
        <p className="mt-1 text-gray-400">
          Khám phá và cài đặt skills cho AI coding assistant của bạn
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} placeholder="Tìm kiếm skills..." />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sắp xếp:</span>
          <button
            type="button"
            onClick={() => setSort("popular")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              sort === "popular"
                ? "bg-accent text-white"
                : "bg-surface-card text-gray-400 hover:bg-surface-hover"
            }`}
          >
            ↑ Nhiều sao
          </button>
          <button
            type="button"
            onClick={() => setSort("newest")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              sort === "newest"
                ? "bg-accent text-white"
                : "bg-surface-card text-gray-400 hover:bg-surface-hover"
            }`}
          >
            Mới nhất
          </button>
        </div>
      </div>

      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          totalCount={total}
        />
      </div>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loading />
        </div>
      ) : skills.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          Chưa có skill nào. Thử đổi từ khóa hoặc category.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-white/10 bg-surface-card px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-surface-hover"
              >
                Trước
              </button>
              <span className="flex items-center px-4 text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-white/10 bg-surface-card px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-surface-hover"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
