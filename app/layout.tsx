import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/layout/session-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "StudySwap — #1 Platform for International Students",
    template: "%s | StudySwap",
  },
  description:
    "Share study materials, find tutors, apply to jobs and use AI to learn more effectively. The #1 platform for international students.",
  keywords: ["study", "materials", "tutoring", "jobs", "students", "credits", "international"],
  openGraph: {
    type: "website",
    siteName: "StudySwap",
    title: "StudySwap — #1 Platform for International Students",
    description: "The all-in-one digital ecosystem for students worldwide",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
