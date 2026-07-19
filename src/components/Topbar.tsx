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
    <header className="h-12 border-b border-muted flex items-center px-4 gap-3 bg-secondary shrink-0">
      <div className="flex-1 flex items-center gap-3">
      <SidebarTrigger />
      <Button
      variant="outline"
        onClick={() => setSearchOpen(true)}
      >
        <MagnifyingGlassIcon className="w-3.5 h-3.5 shrink-0" />
        Ask anything or search docs…
      </Button>
      </div>
      <ThemeToggle />
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}