import DbPageWrapper from "@/components/dashboard/page-wrapper";
import WorkplaceForm from "@/components/dashboard/workplaces/workplace-form";
import React from "react";

const CreateWorkplacePage = () => {
  return (
    <DbPageWrapper title="Create workplace" bare>
      <WorkplaceForm />
    </DbPageWrapper>
  );
};

export default CreateWorkplacePage;
