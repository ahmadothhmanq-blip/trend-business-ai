import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { DashboardProjectsPage } from "@/components/dashboard/projects-page";

export async function generateMetadata() {
  return dashboardPageMetadata("projects");
}

export default function ProjectsPage() {
  return <DashboardProjectsPage />;
}
