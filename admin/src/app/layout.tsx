import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminLayout } from "@/components/layout/AdminLayout";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-50">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
