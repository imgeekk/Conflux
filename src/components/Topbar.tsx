"use client"
import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import SearchSheet from "./SearchSheet"
export default function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  return (
    <header className="h-12 border-b border-muted flex items-center px-3 md:px-4 gap-2 md:gap-3 bg-secondary shrink-0 sticky top-0 z-10">
      <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
      <SidebarTrigger />
      <Button
      variant="outline"
        onClick={() => setSearchOpen(true)}
        className="min-w-0 flex-1 md:flex-none"
      >
        <MagnifyingGlassIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline truncate">Ask anything or search docs…</span>
        <span className="sm:hidden">Search</span>
      </Button>
      </div>
      <ThemeToggle />
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}