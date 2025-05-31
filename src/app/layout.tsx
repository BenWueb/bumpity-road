import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AuthProvider from "@/app/providers/AuthProvider";

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
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar collapsible="icon" />
        <html lang="en">
          <body className={`${poppins.className} antialiased`}>
            <main className="w-full">
              <SidebarTrigger />
              {children}
            </main>
          </body>
        </html>
      </SidebarProvider>
    </AuthProvider>
  );
}
