"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useEffect } from "react";
import TurndownService from "turndown";

const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-white/10 bg-surface text-gray-500">
      Đang tải editor...
    </div>
  ),
});

let turndownService: InstanceType<typeof TurndownService> | null = null;
function getTurndown() {
  if (!turndownService) {
    turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
  }
  return turndownService;
}

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
};

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  height = 320,
  className = "",
}: MarkdownEditorProps) {
  const cursorAfterPaste = useRef<number | null>(null);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const html = e.clipboardData?.getData("text/html");
      const plain = e.clipboardData?.getData("text/plain");
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;

      if (html && html.trim()) {
        e.preventDefault();
        try {
          const md = getTurndown().turndown(html);
          const before = value.slice(0, start);
          const after = value.slice(end);
          const newValue = before + md + after;
          onChange(newValue);
          cursorAfterPaste.current = start + md.length;
        } catch {
          const newValue = value.slice(0, start) + plain + value.slice(end);
          onChange(newValue);
          cursorAfterPaste.current = start + (plain?.length ?? 0);
        }
      }
    },
    [value, onChange]
  );

  useEffect(() => {
    if (cursorAfterPaste.current === null) return;
    const pos = cursorAfterPaste.current;
    cursorAfterPaste.current = null;
    requestAnimationFrame(() => {
      const ta = document.querySelector(".w-md-editor-text-input") as HTMLTextAreaElement | null;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(pos, pos);
      }
    });
  }, [value]);

  return (
    <div className={className} data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        height={height}
        textareaProps={{
          placeholder,
          onPaste: handlePaste,
        }}
        preview="edit"
        hideToolbar={false}
        visibleDragbar={false}
        className="!bg-surface !border-white/10"
      />
    </div>
  );
}
