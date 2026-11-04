import { redirect } from "next/navigation";

const WorkplaceDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return redirect(`/dashboard/workplaces/${slug}/edit`);
};

export default WorkplaceDetailPage;
