import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AnyTradesman - Find Trusted Local Contractors & Service Pros",
    template: "%s | AnyTradesman",
  },
  description:
    "Connect with verified local contractors, plumbers, electricians, and more. Get free quotes from trusted professionals in your area.",
  keywords: [
    "contractors",
    "home services",
    "plumbers",
    "electricians",
    "handyman",
    "home repair",
    "local services",
  ],
  authors: [{ name: "AnyTradesman" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anytradesman.com",
    siteName: "AnyTradesman",
    title: "AnyTradesman - Find Trusted Local Contractors & Service Pros",
    description:
      "Connect with verified local contractors, plumbers, electricians, and more. Get free quotes from trusted professionals in your area.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AnyTradesman - Find Trusted Local Contractors & Service Pros",
    description:
      "Connect with verified local contractors, plumbers, electricians, and more. Get free quotes from trusted professionals in your area.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
