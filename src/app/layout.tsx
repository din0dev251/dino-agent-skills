import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skills Marketplace",
  description: "Tổng hợp và khám phá các agent skills cho AI coding assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <SessionProvider>
          <Header />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
