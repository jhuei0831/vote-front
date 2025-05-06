import api from "@/utils/api";
import { useMutation, useQuery } from "@tanstack/react-query";

/**
 * Question type represents the structure of a question.
 */
export type Question = {
  id: string;
  title: string;
  updated_at: string;
};

/**
 * QuestionCreate type represents the structure of a question creation request.
 */
export type QuestionCreate = {
  vote_id: string;
  title: string;
  description: string;
}

/**
 * Fetches a list of questions based on vote ID, page number, and size.
 * @param voteId 
 * @param page 
 * @param size 
 * @returns 
 */
export async function fetchQuestions(voteId: string, page: number, size: number) {
  try {
    const response = await api.get("/v1/question/list/"+voteId, { params: { page, size } });
    return response.data;
  } catch (err) {
    console.error(err);
    return { data: [], pagination: { total: 0, total_pages: 0 } };
  }
}

/**
 * Deletes a question based on its ID.
 * 
 * @param id 
 */
export async function handleDelete(id: string) {
  if (confirm("Are you sure you want to delete this question?")) {
    try {
      const response = await api.delete(`/v1/question/`, { data: [id] });
      alert(response.data.msg);
      window.location.reload();
    } catch (err) {
      alert("Failed to delete question.");
      console.log(err);
    }
  }
}

/**
 * Fetches questions based on vote ID, page index, and page size.
 * @param voteId 
 * @param pageIndex 
 * @param pageSize 
 * @returns 
 */
export function useQuestions(voteId: string, pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: ['questions', voteId, pageIndex, pageSize],
    queryFn: async () => {
      // Only fetch if voteId exists
      if (!voteId) return { data: [], pagination: { total: 0, total_pages: 0 } };
      return fetchQuestions(voteId, pageIndex + 1, pageSize);
    },
    enabled: !!voteId, // Only run query if voteId exists
    staleTime: 60000,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

export function useVoterQuestions() {
  return useQuery({
    queryKey: ['voterQuestions'],
    queryFn: async () => {
      const response = await api.get("/v1/voter/questions");
      return response.data;
    },
    staleTime: 60000,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

/**
 * Creates a new question.
 * @returns The created question data.
 */
export function useCreateQuestion() {
  return useMutation({
    mutationFn: async (data: QuestionCreate) => {
      const response = await api.post("/v1/question/create", {
        vote_id: data.vote_id,
        title: data.title,
        description: data.description,
      });

      return response.data;
    }
  });
}