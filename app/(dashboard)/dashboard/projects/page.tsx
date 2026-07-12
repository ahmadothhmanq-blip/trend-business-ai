import type { Metadata } from "next";
import { DashboardProjectsPage } from "@/components/dashboard/projects-page";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <DashboardProjectsPage />;
}
