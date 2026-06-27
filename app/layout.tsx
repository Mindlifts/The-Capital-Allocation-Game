import type { Metadata } from "next";
import "./globals.css";
import "./report-overrides.css";
import "./route-map.css";
import "./character-encounter.css";
import "./landing-entry.css";
import "./memory-engine.css";

export const metadata: Metadata = {
  title: "Capital Allocation Game",
  description: "A fictional investing strategy game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
