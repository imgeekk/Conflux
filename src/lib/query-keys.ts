export const queryKeys = {
  workspace: {
    all: ["workspace"] as const,
    byUser: (userId: string) => ["workspace", userId] as const,
  },
  spaces: {
    all: ["spaces"] as const,
    byWorkspace: (workspaceId: string) => ["spaces", workspaceId] as const,
  },
  documents: {
    all: ["documents"] as const,
    bySpace: (spaceId: string) => ["documents", spaceId] as const,
    byId: (docId: string) => ["document", docId] as const,
  },
  questions: {
    all: ["questions"] as const,
    bySpace: (spaceId: string) => ["questions", spaceId] as const,
    byId: (questionId: string) => ["question", questionId] as const,
  },
};
