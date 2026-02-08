import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppSidebar from "@/components/AppSidebar";
import BadgeClaimHandler from "@/components/BadgeClaimHandler";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AnnouncementBar from "@/components/AnnouncementBar";

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
  description: "Paradise at the end of a not so smooth road.",
  keywords: ["cabin", "family", "vacation", "memories", "adventures", "nature"],
  authors: [{ name: "Bumpity Road" }],
  creator: "Bumpity Road",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://bumpity-road.vercel.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Bumpity Road",
    title: "Bumpity Road",
    description: "Paradise at the end of a not so smooth road.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bumpity Road",
    description: "Paradise at the end of a not so smooth road.",
    creator: "@bumpityroad",
  },
  other: {
    // iMessage and other messaging apps use these
    "apple-mobile-web-app-title": "Bumpity Road",
    "application-name": "Bumpity Road",
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
      <body
        className={`${poppins.className} antialiased min-h-screen h-screen h-dvh overflow-hidden`}
      >
        <GoogleAnalytics />
        <div className="flex min-h-screen h-screen h-dvh w-full flex-col overflow-hidden">
          <AnnouncementBar />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <AppSidebar />
            <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
        <BadgeClaimHandler />
      </body>
    </html>
  );
}
