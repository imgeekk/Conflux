import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSpacesByWorkspaceId, getWorkspaceByUserId } from "@/lib/services";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const workspace = await getWorkspaceByUserId(session.user.id);
  if (!workspace) redirect("/new-workspace");
  return (
    <WorkspaceProvider workspace={workspace}>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset className="overflow-y-auto min-h-0">
          <Topbar />
          <main className="flex-1 flex flex-col p-6 bg-background text-foreground">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
