import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiDocument, CreateDocumentInput } from "@/lib/types";

export function useDocuments(spaceId: string) {
  return useQuery({
    queryKey: queryKeys.documents.bySpace(spaceId),
    queryFn: async () => {
      const res = await fetch(`/api/documents?spaceId=${spaceId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch documents");
      }
      return res.json() as Promise<ApiDocument[]>;
    },
    enabled: !!spaceId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDocumentInput) => {
      const res = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create document");
      }
      return res.json() as Promise<ApiDocument>;
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.bySpace(doc.spaceId),
      });
    },
  });
}
