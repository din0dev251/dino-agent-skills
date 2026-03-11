"use client";

import { useState } from "react";
import type { Skill } from "@/types";

type SkillCardProps = {
  skill: Skill;
  onStar?: (id: string) => void;
};

export function SkillCard({ skill, onStar }: SkillCardProps) {
  const [starCount, setStarCount] = useState(skill.starCount);
  const [loading, setLoading] = useState(false);

  const handleStar = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/skills/${skill.id}/star`, { method: "POST" });
      const data = await res.json();
      if (data.starCount != null) {
        setStarCount(data.starCount);
        onStar?.(skill.id);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="flex flex-col rounded-xl border border-white/10 bg-surface-card p-4 transition hover:border-white/20 hover:bg-surface-hover">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white line-clamp-1">{skill.title}</h3>
        <button
          type="button"
          onClick={handleStar}
          disabled={loading}
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm text-amber-400 transition hover:bg-white/10 disabled:opacity-50"
          title="Star (phổ biến)"
        >
          <span className="text-lg">★</span>
          <span>{starCount.toLocaleString()}</span>
        </button>
      </div>
      <p className="mb-3 flex-1 text-sm text-gray-400 line-clamp-3">
        {skill.description || "Không có mô tả."}
      </p>
      {skill.link && (
        <a
          href={skill.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 text-xs text-accent hover:underline"
        >
          Xem thêm →
        </a>
      )}
    </article>
  );
}
