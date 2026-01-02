import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppSidebar from "@/components/AppSidebar";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bumpity Road",
  description: "The Cabin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
