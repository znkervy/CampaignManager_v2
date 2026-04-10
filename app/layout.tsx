import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOPECARD - Campaign Manager",
  description: "Manage and track your active initiatives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
