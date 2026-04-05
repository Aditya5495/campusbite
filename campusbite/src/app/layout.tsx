import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "@/components/layout/AppProvider";

export const metadata: Metadata = {
  title: "CampusBite - Bennett University Food Pre-Order",
  description: "Order food from Bennett University outlets instantly or schedule for later.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
