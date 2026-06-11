"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewWorkspacePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    if (res.ok) {
      router.push("/home")
    } else {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Create your workspace
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            This is your team's home in Conflux
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600">
                Workspace name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="Acme Inc."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-neutral-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create workspace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}