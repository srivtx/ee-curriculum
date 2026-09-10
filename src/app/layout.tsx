import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/curriculum/theme-provider";
import { ProgressProvider } from "@/hooks/useProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EE Curriculum for Computer Scientists · by srivtx",
  description:
    "A 12-month Electrical Engineering curriculum mapped onto CS concepts. Browse phases, run Python demos in-browser, track your progress.",
  keywords: [
    "EE",
    "Electrical Engineering",
    "Computer Science",
    "Curriculum",
    "Pyodide",
    "Signals",
    "Circuits",
    "DSP",
    "srivtx",
  ],
  authors: [{ name: "srivtx", url: "https://github.com/srivtx" }],
  creator: "srivtx",
  openGraph: {
    title: "EE Curriculum for Computer Scientists",
    description: "A 12-month project-based EE curriculum for CS engineers. By srivtx.",
    type: "website",
    url: "https://github.com/srivtx/ee-curriculum",
  },
  twitter: {
    card: "summary_large_image",
    title: "EE Curriculum for Computer Scientists",
    description: "A 12-month project-based EE curriculum for CS engineers. By srivtx.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <ProgressProvider>
            {children}
            <Toaster />
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
