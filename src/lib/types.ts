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

export type ApiWorkspace = {
  id: string;
  name: string;
  slug: string;
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

export type ApiQuestion = {
  id: string;
  text: string;
  spaceId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiAnswer = {
  id: string;
  body: string;
  questionId: string;
  authorId: string;
  isAiDraft: boolean;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiAnswerWithAuthor = ApiAnswer & {
  author: { id: string; name: string; image: string | null };
};

export type ApiQuestionWithAnswers = ApiQuestion & {
  answers: ApiAnswerWithAuthor[];
  author: { id: string; name: string; image: string | null };
};


export type CreateWorkspaceInput = {
  name: string;
};

export type CreateSpaceInput = {
  name: string;
  description?: string;
  workspaceId: string;
};

export type CreateDocumentInput = {
  title: string;
  content?: string;
  spaceId: string;
};

export type CreateQuestionInput = {
  text: string;
  spaceId: string;
};

export type CreateAnswerInput = {
  body: string;
}

export type UpdateDocumentInput = {
  title?: string;
  content?: string;
};

export type UpdateQuestionInput = {
  text?: string;
};

export type UpdateAnswerInput = {
  answerId: string;
  body?: string;
}

export type ProseMirrorNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: ProseMirrorNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

export type ProseMirrorDoc = {
  type: "doc";
  content: ProseMirrorNode[];
};
