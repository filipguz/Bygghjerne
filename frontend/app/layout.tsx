import type { Metadata } from "next";
import "./globals.css";
import { BuildingProvider } from "@/utils/building-context";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Bygghjerne",
  description: "AI-driftsassistent for bygget",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <ThemeProvider>
          <BuildingProvider>{children}</BuildingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
