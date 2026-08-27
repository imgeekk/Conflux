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
  title: {
    default: "Conflux - The Knowledge Base for Teams",
    template: "%s | Conflux",
  },
  description:
    "Conflux is a collaborative knowledge base for teams. Ask questions, share answers, and build a living wiki across every workspace.",
  openGraph: {
    title: "Conflux - The Knowledge Base for Teams",
    description:
      "Conflux is a collaborative knowledge base for teams. Ask questions, share answers, and build a living wiki across every workspace.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Conflux — The Knowledge Base for Teams",
      },
    ],
    siteName: "Conflux",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conflux — The Knowledge Base for Teams",
    description:
      "Conflux is a collaborative knowledge base for teams. Ask questions, share answers, and build a living wiki across every workspace.",
    images: ["/og.png"],
  },
  metadataBase: new URL("https://conflux-v0.vercel.app"),
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
