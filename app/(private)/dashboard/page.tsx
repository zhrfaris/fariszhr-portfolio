import { auth } from "@/auth";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  redirect("/dashboard/profile/edit-profile");
};

export default DashboardPage;
