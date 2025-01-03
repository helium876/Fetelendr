import { Inter } from "next/font/google";
import "./globals.css";
import Footer from '@/components/Footer';
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FeteLendr - Find Fetes in Jamaica",
  description: "Find a Fete on the Calendar in Jamaica. Powered by Codewhare, Lucy and Vagabond and IAmSoca.",
  keywords: "fete, jamaica, events, parties, caribbean, soca, carnival",
  openGraph: {
    title: "FeteLendr - Find Fetes in Jamaica",
    description: "Find a Fete on the Calendar in Jamaica. Powered by Codewhare, Lucy and Vagabond and IAmSoca.",
    type: "website",
    locale: "en_US",
    siteName: "FeteLendr",
  },
  twitter: {
    card: "summary_large_image",
    title: "FeteLendr - Find Fetes in Jamaica",
    description: "Find a Fete on the Calendar in Jamaica. Powered by Codewhare, Lucy and Vagabond and IAmSoca.",
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#4C1D95",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
