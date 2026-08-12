"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Sidebar as SidebarPrimitive,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  HouseIcon,
  MagnifyingGlassIcon,
  QuestionIcon,
  StackIcon,
  PlusIcon,
  GearIcon,
  SignOutIcon,
  ArrowDownIcon,
  FolderIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useWorkspace } from "@/lib/workspace-context";
import { useSpaces } from "@/hooks/use-spaces";
import { Skeleton } from "./ui/skeleton";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace } = useWorkspace();
  const { data: spaces = [], isLoading } = useSpaces(workspace?.id ?? "");

  const navItems = [
    { href: "/home", label: "Home", icon: HouseIcon },
    { href: "/search", label: "Search", icon: MagnifyingGlassIcon },
    { href: "/questions", label: "Questions", icon: QuestionIcon },
    { href: "/workspace/members", label: "Members", icon: UsersThreeIcon },
  ];

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
  }

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-1.5 px-2 py-1">
          <StackIcon className="w-4 h-4 shrink-0 text-sidebar-foreground" />
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {workspace?.name ?? "Conflux"}
          </span>
          <ArrowDownIcon className="w-3 h-3 ml-auto shrink-0 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <div className="flex items-center justify-between w-full">
              <span>Spaces</span>
              <Link
                href="/spaces/new"
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                title="New space"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
               </> 
              ) : spaces.length === 0 ? (
                <p className="px-2 py-1 text-xs text-sidebar-foreground/50">
                  No spaces yet
                </p>
              ) : (
                spaces.map((space) => (
                  <SidebarMenuItem key={space.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(`/spaces/${space.id}`)}
                      tooltip={space.name}
                    >
                      <Link href={`/spaces/${space.id}`}>
                        <FolderIcon className="shrink-0 text-chart-2" />

                        <span className="truncate">{space.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <GearIcon className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
              <SignOutIcon className="w-4 h-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
