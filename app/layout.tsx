import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arya — HR Email Builder POC",
  description: "Drag-and-drop email builder from reverse-engineered HTML templates"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
