import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        href="/admin/skills"
        className="rounded-xl border border-white/10 bg-surface-card p-6 transition hover:border-accent/50"
      >
        <h2 className="font-semibold text-white">Quản lý Skills</h2>
        <p className="mt-1 text-sm text-gray-400">
          Thêm, sửa, xóa agent skills.
        </p>
      </Link>
      <Link
        href="/admin/categories"
        className="rounded-xl border border-white/10 bg-surface-card p-6 transition hover:border-accent/50"
      >
        <h2 className="font-semibold text-white">Quản lý Categories</h2>
        <p className="mt-1 text-sm text-gray-400">
          Thêm, sửa, xóa danh mục.
        </p>
      </Link>
      <Link
        href="/admin/docs"
        className="rounded-xl border border-white/10 bg-surface-card p-6 transition hover:border-accent/50"
      >
        <h2 className="font-semibold text-white">Documentation</h2>
        <p className="mt-1 text-sm text-gray-400">
          Chỉnh sửa nội dung trang tài liệu.
        </p>
      </Link>
    </div>
  );
}
