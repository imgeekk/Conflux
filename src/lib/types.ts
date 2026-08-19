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
  tags: ApiTag[];
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
  confidence: number | null;
  lowConfidence: boolean | null;
  expertId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiAnswerWithAuthor = ApiAnswer & {
  author: { id: string; name: string; image: string | null };
  expert: { id: string; name: string; image: string | null } | null;
};

export type ApiQuestionWithAnswers = ApiQuestion & {
  answers: ApiAnswerWithAuthor[];
  author: { id: string; name: string; image: string | null };
};

export type ApiTag = {
  id: string;
  name: string;
};

export type ApiExperScore = {
  id: string;
  userId: string;
  tagId: string;
  score: number;
};

export type ApiExpertScoreWithTag = ApiExperScore & {
  tag: ApiTag;
};

export type ApiExpertScoreWithUser = ApiExperScore & {
  user: { id: string; name: string; image: string | null };
};

export type ApiExpertSummary = {
  id: string;
  name: string;
  image: string | null;
  totalScore: number;
  topTag?: ApiTag;
};

export type ApiMember = {
  id: string;
  userId: string;
  workspaceId: string;
  role: "OWNER" | "MEMBER";
  createdAt: string;
  user: { id: string; name: string; email: string; image: string | null };
};

export type ApiInvite = {
  id: string;
  code: string;
  workspaceId: string;
  createdAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
  revoked: boolean;
};

export type ApiInviteWithWorkspace = ApiInvite & {
  workspace: { id: string; name: string };
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
  tagIds?: string[];
};

export type CreateQuestionInput = {
  text: string;
  spaceId: string;
};

export type CreateAnswerInput = {
  body: string;
};

export type CreateTagInput = {
  name: string;
};

export type UpdateDocumentInput = {
  title?: string;
  content?: string;
  tagIds?: string[];
};

export type UpdateQuestionInput = {
  text?: string;
};

export type UpdateAnswerInput = {
  answerId: string;
  body?: string;
};

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

export type SearchSource = {
  sourceId: string;
  sourceTitle: string;
  sourceType: "document" | "answer";
  spaceId: string;
  author: { name: string; image: string | null } | null;
};

export type SearchResponse = {
  answer: string;
  confidence: number;
  lowConfidence: boolean;
  expert: ApiExpertSummary | null;
  sources: SearchSource[];
};
