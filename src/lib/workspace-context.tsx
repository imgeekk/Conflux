"use client";
import { createContext, useContext, ReactNode } from "react";
import { Workspace, WorkspaceContextValues } from "./types";

const WorkspaceContext = createContext<WorkspaceContextValues>({
  workspace: null,
  loading: true,
});
export function WorkspaceProvider({
  workspace,
  children,
}: {
  workspace: Workspace | null;
  children: ReactNode;
}) {
  return (
    <WorkspaceContext.Provider value={{ workspace, loading: false }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  return useContext(WorkspaceContext);
}
