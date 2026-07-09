"use client"

import { useRouter } from "next/navigation"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"

export default function Topbar() {
  const router = useRouter()

  return (
    <header className="h-12 border-b border-muted flex items-center px-4 gap-3 bg-secondary shrink-0">
      <SidebarTrigger />
      <Button
        onClick={() => router.push("/search")}
      >
        <MagnifyingGlassIcon className="w-3.5 h-3.5 shrink-0" />
        Ask anything or search docs…
      </Button>
      <ThemeToggle />
    </header>
  )
}