"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Loading } from "@/components/ui/Loading";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.replace("/login?callbackUrl=/admin");
      return;
    }
    if (session.user.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);

  if (status === "loading" || !session?.user?.id || session.user.role !== "admin") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-4 border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold text-white">Admin</h1>
        <nav className="flex gap-4">
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-white"
          >
            Tổng quan
          </Link>
          <Link
            href="/admin/skills"
            className="text-sm text-gray-400 hover:text-white"
          >
            Skills
          </Link>
          <Link
            href="/admin/categories"
            className="text-sm text-gray-400 hover:text-white"
          >
            Categories
          </Link>
          <Link
            href="/admin/docs"
            className="text-sm text-gray-400 hover:text-white"
          >
            Documentation
          </Link>
          <Link
            href="/admin/resources"
            className="text-sm text-gray-400 hover:text-white"
          >
            Tư liệu quý
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
