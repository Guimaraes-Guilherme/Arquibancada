import "./globals.css";
import type { Metadata, Viewport } from "next";
import RegistraSW from "@/components/RegistraSW";

export const metadata: Metadata = {
  title: "Arquibancada",
  description: "Placares, notícias e regras de Futebol, F1, UFC e Basquete",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Arquibancada", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <RegistraSW />
      </body>
    </html>
  );
}
