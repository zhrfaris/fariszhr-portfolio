import LenisProvider from "@/components/utils/providers/lenis-provider";
import Header from "@/components/layouts/header";
import { getUserByUsername } from "@/actions/user/get";
import { MAIN_USERNAME } from "@/lib/db";
import { auth } from "@/auth";
import { Suspense } from "react";
import NavigationEvents from "@/components/utils/navigation-events";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = await getUserByUsername(MAIN_USERNAME);

  return (
    <>
      <Header user={user} session={session} />
      <LenisProvider>
        <main>{children}</main>
        <Suspense fallback={null}>
          <NavigationEvents />
        </Suspense>
      </LenisProvider>
    </>
  );
}
