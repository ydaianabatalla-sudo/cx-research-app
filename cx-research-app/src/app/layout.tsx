import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CX Research — NPS, CSAT, CES",
  description: "Plataforma de surveys de experiencia de cliente con dashboards y closing the loop"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg text-white">{children}</body>
    </html>
  );
}
