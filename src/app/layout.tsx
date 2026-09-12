import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/curriculum/theme-provider";
import { ProgressProvider } from "@/hooks/useProgress";

// Fonts — Inter with multiple weights for proper hierarchy (not just 400)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EE Curriculum · by svx",
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
    "svx",
    "Sribatsha dash",
  ],
  authors: [{ name: "svx", url: "https://github.com/srivtx" }],
  creator: "svx",
  openGraph: {
    title: "EE Curriculum for Computer Scientists",
    description: "A 12-month project-based EE curriculum for CS engineers. By svx.",
    type: "website",
    url: "https://github.com/srivtx/ee-curriculum",
  },
  twitter: {
    card: "summary_large_image",
    title: "EE Curriculum for Computer Scientists",
    description: "A 12-month project-based EE curriculum for CS engineers. By svx.",
  },
  icons: {
    icon: "/logo.svg",
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} ${pressStart2P.variable} antialiased bg-background text-foreground`}
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
