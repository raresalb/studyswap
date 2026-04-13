import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/layout/session-provider";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StudySwap — Platforma Educațională pentru Studenți",
    template: "%s | StudySwap",
  },
  description:
    "Schimbă materiale de studiu, găsește tutori, aplică la joburi și folosește AI pentru a învăța mai eficient.",
  keywords: ["studiu", "materiale", "tutoriat", "joburi", "studenți", "credite"],
  openGraph: {
    type: "website",
    siteName: "StudySwap",
    title: "StudySwap — Platforma Educațională pentru Studenți",
    description: "Ecosistemul digital complet pentru studenții din România",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
