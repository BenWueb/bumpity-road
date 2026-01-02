import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppSidebar from "@/components/AppSidebar";
import BadgeClaimHandler from "@/components/BadgeClaimHandler";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bumpity Road",
    template: "%s | Bumpity Road",
  },
  description: "The Cabin - A place for family memories, adventures, and togetherness.",
  keywords: ["cabin", "family", "vacation", "memories", "adventures", "nature"],
  authors: [{ name: "Bumpity Road" }],
  creator: "Bumpity Road",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bumpity-road.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Bumpity Road",
    title: "Bumpity Road",
    description: "The Cabin - A place for family memories, adventures, and togetherness.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bumpity Road",
    description: "The Cabin - A place for family memories, adventures, and togetherness.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
  },
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
        <BadgeClaimHandler />
      </body>
    </html>
  );
}
