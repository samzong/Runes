import type { Metadata } from "next";

import "@fontsource/ubuntu-mono/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Runes — Personal identity infrastructure",
  description: "One authored visual language for every project, platform, and product surface.",
  openGraph: {
    title: "Runes — Personal identity infrastructure",
    description: "One authored visual language for every project, platform, and product surface.",
    images: ["/og.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Runes — Personal identity infrastructure",
    description: "One authored visual language for every project, platform, and product surface.",
    images: ["/og.svg"],
  },
  icons: {
    icon: "/generated/runes/app-icon.svg",
    apple: "/generated/runes/app-icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
