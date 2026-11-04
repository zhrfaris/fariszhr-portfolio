import { getCategories } from "@/actions/category/get";
import { auth } from "@/auth";
import CategoryForm from "@/components/dashboard/categories/category-form";
import { CategoryTable } from "@/components/dashboard/categories/category-table";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import { SectionCard } from "@/components/dashboard/section-card";
import PopoverForm from "@/components/form/popover-form";
import { Button } from "@/components/shadcn/button";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

const ManageCategoriesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const categories = await getCategories(session?.user.id);

  return (
    <DbPageWrapper title="Categories">
      <SectionCard
        icon="categories"
        title="Categories"
        description="Labels that group your case studies, like Mobile App or Cartography."
        action={
          <PopoverForm
            align="end"
            title="New category"
            FormComponent={CategoryForm}
          >
            <Button>
              <Plus />
              New category
            </Button>
          </PopoverForm>
        }
      >
        <CategoryTable data={categories} />
      </SectionCard>
    </DbPageWrapper>
  );
};

export default ManageCategoriesPage;
