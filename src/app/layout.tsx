import type { Metadata } from "next";
import { Inter, Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  style: "italic",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Conflux",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-svh overflow-hidden flex flex-col bg-background text-foreground">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
