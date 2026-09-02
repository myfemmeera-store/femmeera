import type { Metadata } from "next";
import "./globals.css";
import { AdminLayout } from "@/components/layout/AdminLayout";

export const metadata: Metadata = {
  title: "Femmeera Admin Panel",
  description: "Mobile-First Operational Command Center for Femmeera E-Commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-neutral-50 font-sans text-neutral-900">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
