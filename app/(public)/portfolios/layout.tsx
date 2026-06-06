import Header from "@/components/layouts/header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <>{children}</>
    </>
  );
}
