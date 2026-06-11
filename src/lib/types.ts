export type Workspace = {
  id: string
  name: string
  slug: string
}

export type WorkspaceContextValues = {
  workspace: Workspace | null
  loading: boolean
}