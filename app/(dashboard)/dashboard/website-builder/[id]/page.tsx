import { WebsiteManagementDashboard } from "@/components/dashboard/website-builder/website-management-dashboard";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WebsiteManagePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <WebsiteManagementDashboard generationId={id} />
    </div>
  );
}
