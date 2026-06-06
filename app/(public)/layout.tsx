import LenisProvider from "@/components/utils/providers/lenis-provider";
// import Header from "@/components/layouts/header";
// import { Suspense } from "react";
// import NavigationEvents from "@/components/utils/navigation-events";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <Header /> */}
      <LenisProvider>
        <main>{children}</main>
        {/* <Suspense fallback={null}>
          <NavigationEvents />
        </Suspense> */}
      </LenisProvider>
    </>
  );
}
