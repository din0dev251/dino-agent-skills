"use client";

import type { Category } from "@/types";

type CategoryFilterProps = {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  totalCount: number;
};

export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
  totalCount,
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            selectedId === ""
              ? "bg-accent text-white"
              : "bg-surface-card text-gray-400 hover:bg-surface-hover hover:text-white"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              selectedId === cat.id
                ? "bg-accent text-white"
                : "bg-surface-card text-gray-400 hover:bg-surface-hover hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500">{totalCount} skills</p>
    </div>
  );
}
