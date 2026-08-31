"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Minimal project shape shared by Recent Projects UI surfaces. */
export type RecentWorkspaceProject = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  favorite: boolean;
  description: string;
  mode?: string;
  parentGenerationId?: string | null;
  status?: string;
};

type WebsiteBuilderProjectsContextValue = {
  projects: RecentWorkspaceProject[];
  activeProject: RecentWorkspaceProject | null;
};

const WebsiteBuilderProjectsContext =
  createContext<WebsiteBuilderProjectsContextValue | null>(null);

export function WebsiteBuilderProjectsProvider({
  projects,
  activeProject,
  children,
}: WebsiteBuilderProjectsContextValue & { children: ReactNode }) {
  return (
    <WebsiteBuilderProjectsContext.Provider value={{ projects, activeProject }}>
      {children}
    </WebsiteBuilderProjectsContext.Provider>
  );
}

/** Live Recent Projects list — always reads parent `projects` state, never SSR seed. */
export function useWebsiteBuilderProjects() {
  const value = useContext(WebsiteBuilderProjectsContext);
  if (!value) {
    throw new Error(
      "useWebsiteBuilderProjects must be used within WebsiteBuilderProjectsProvider",
    );
  }
  return value;
}
