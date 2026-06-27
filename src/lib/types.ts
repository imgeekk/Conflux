export type Workspace = {
  id: string;
  name: string;
  slug: string;
};

export type WorkspaceContextValues = {
  workspace: Workspace | null;
  loading: boolean;
};

export type ApiSpace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  workspaceId: string;
};

export type CreateSpaceInput = {
  name: string;
  description?: string;
  workspaceId: string;
};

export type ApiWorkspace = {
  id: string;
  name: string;
  slug: string;
};

export type CreateWorkspaceInput = {
  name: string;
};

export type ApiDocument = {
  id: string;
  title: string;
  content: string | null;
  spaceId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateDocumentInput = {
  title: string;
  content?: string;
  spaceId: string;
};
