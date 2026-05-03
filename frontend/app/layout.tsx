import type { Metadata } from "next";
import "./globals.css";
import { BuildingProvider } from "@/utils/building-context";

export const metadata: Metadata = {
  title: "Serv24",
  description: "AI-driftsassistent for bygget",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <BuildingProvider>{children}</BuildingProvider>
      </body>
    </html>
  );
}
