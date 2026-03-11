"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Loading } from "@/components/ui/Loading";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-bold text-white">
            &gt;_
          </span>
          Agent Skills
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Marketplace
          </Link>
          <Link
            href="/documentation"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Documentation
          </Link>
          <Link
            href="/tu-lieu-quy"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Tư liệu quý
          </Link>
          {status === "loading" ? (
            <Loading size="sm" />
          ) : session ? (
            <>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm text-amber-400 transition hover:text-amber-300"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/my-projects"
                className="text-sm text-gray-300 transition hover:text-white"
              >
                Dự án của tôi
              </Link>
              <span className="text-sm text-gray-500">{session.user.email}</span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-md bg-surface-hover px-3 py-1.5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-300 transition hover:text-white"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
