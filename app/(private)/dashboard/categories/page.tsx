import { getCategories } from "@/actions/category/get";
import { auth } from "@/auth";
import CategoryForm from "@/components/dashboard/categories/category-form";
import { CategoryTable } from "@/components/dashboard/categories/category-table";
import DbPageWrapper from "@/components/dashboard/page-wrapper";
import { redirect } from "next/navigation";
import React from "react";

const ManageCategoriesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const categories = await getCategories(session?.user.id);

  return (
    <DbPageWrapper title="Categories" CreateFormComponent={CategoryForm}>
      <CategoryTable data={categories} />
    </DbPageWrapper>
  );
};

export default ManageCategoriesPage;
