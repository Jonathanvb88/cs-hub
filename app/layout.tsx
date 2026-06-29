import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS Hub | Client Success Operating System",
  description: "AI-powered Client Success platform by URUP Connect",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
