import { getUserById } from "@/actions/user/get";
import { auth } from "@/auth";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import ProfileForm from "@/components/dashboard/profile/profile-form";
import React from "react";

const EditProfilePage = async () => {
  const session = await auth();

  if (!session?.user.id) {
    return (
      <>
        <p>loading.. (or no session)</p>
      </>
    );
  }

  const user = await getUserById(session?.user?.id);

  return (
    <DbPageWrapper title="Edit Profile">
      <ProfileForm user={user} />
    </DbPageWrapper>
  );
};

export default EditProfilePage;
