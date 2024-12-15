import ProfileForm from "@/components/dashboard/profile/profile-form";
import React from "react";

const ManageProfilePage = () => {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="font-bold text-3xl">Profile</h1>
      <ProfileForm />
    </div>
  );
};

export default ManageProfilePage;
