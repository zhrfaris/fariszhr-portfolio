import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { inter } from "@/lib/fonts";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

const metaTitle = "Muhammad Faris Azhar";
const metaDescription =
  "Humanizing technology through design | Embark on transformative journeys with companies I've collaborated with. Uncover challenges and strategic approaches to elevate the product | Portfolio website of Muhammad Faris Azhar, a Product Designer showcasing UX/UI design work and projects.";
const metaImage =
  "https://res.cloudinary.com/dvafoy3bz/image/upload/v1737010262/portfolio-2/ogl1u28yvjcuazduz1at.jpg";

export const metadata: Metadata = {
  title: {
    default: metaTitle,
    template: `%s | ${metaTitle}`,
  },
  description: metaDescription,
  keywords:
    "Muhammad Faris Azhar, M Faris Azhar, Faris Azhar, UI Designer, UX Designer, UI/UX, Product Designer, Portfolio, Portfolio Website",
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
    images: metaImage,
    title: metaTitle,
    description: metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    images: metaImage,
    title: metaTitle,
    description: metaDescription,
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
          <Toaster position="bottom-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
