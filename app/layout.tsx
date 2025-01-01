import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { inter } from "@/lib/fonts";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

const metaTitle = "Muhammad Faris Azhar";
const metaDescription =
  "Humanizing technology through design | Embark on transformative journeys with companies I've collaborated with. Uncover challenges and strategic approaches to elevate the product";
const profilePictUrl =
  "https://res.cloudinary.com/dvafoy3bz/image/upload/v1703692108/Portfolio/izgbzg165oqkrbiaydbw.png";

export const metadata: Metadata = {
  title: {
    default: metaTitle,
    template: `%s | ${metaTitle}`,
  },
  description: metaDescription,
  keywords: "UI/UX, Product Designer, Portfolio, Portfolio Website",
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://fariszhr-portfolio.vercel.app"),
  openGraph: {
    type: "website",
    images: profilePictUrl,
  },
  twitter: {
    card: "summary_large_image",
    images: profilePictUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        ></link>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        ></link>
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        ></link>
        <link rel="manifest" href="/manifest.webmanifest"></link>
      </head>
      <body className={cn(inter.className, "antialiased")}>
        <SessionProvider>
          <>{children}</>
          <Toaster richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
