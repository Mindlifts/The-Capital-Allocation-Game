import type { Metadata } from "next";
import "./globals.css";

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
