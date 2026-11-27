import type { Metadata, Viewport } from "next";

import "@fontsource-variable/inter";
import "./globals.css";

import { Fournisseurs } from "@/components/fournisseurs";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: { default: "Delibera", template: "%s · Delibera" },
  description: "Plateforme de délibération des étudiants",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1745e8",
};

export default function RacineLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full">
        <Fournisseurs>{children}</Fournisseurs>
        <Toaster />
      </body>
    </html>
  );
}
