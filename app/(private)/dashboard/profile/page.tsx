import { redirect } from "next/navigation";

const ProfilePage = () => {
  redirect("/dashboard/profile/edit-profile");
};

export default ProfilePage;
