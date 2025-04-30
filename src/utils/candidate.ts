import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

/**
 * Candidate type represents the structure of a candidate.
 */
export type Candidate = {
  id: string;
  question_id: string;
  name: string;
  updated_at: string;
};

/**
 * CandidateCreate type represents the structure of a candidate creation request.
 */
export type CandidateCreate = {
  question_id: string;
  name: string;
};

/**
 * Fetches candidates based on voteId, page, and size.
 * 
 * @param voteId 
 * @param page 
 * @param size 
 * @returns 
 */
export async function fetchCandidates(voteId: string, page: number, size: number) {
  try {
    const response = await api.get("/v1/candidate/list/"+voteId, { params: { page, size } });
    return response.data;
  } catch (err) {
    console.error(err);
    return { data: [], pagination: { total: 0, total_pages: 0 } };
  }
}

/**
 * Deletes a candidate by ID.
 * 
 * @param id 
 */
export async function handleDelete(id: string) {
  if (confirm("Are you sure you want to delete this candidate?")) {
    try {
      const response = await api.delete(`/v1/candidate/`, { data: [id] });
      alert(response.data.msg);
      window.location.reload();
    } catch (err) {
      alert("Failed to delete candidate.");
      console.log(err);
    }
  }
}

/**
 * Fetches candidates based on voteId, pageIndex, and pageSize.
 * 
 * @param voteId 
 * @param pageIndex 
 * @param pageSize 
 * @returns 
 */
export function useCandidates(voteId: string, pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: ['candidates', voteId, pageIndex, pageSize],
    queryFn: async () => {
      // Only fetch if voteId exists
      if (!voteId) return { data: [], pagination: { total: 0, total_pages: 0 } };
      return fetchCandidates(voteId, pageIndex + 1, pageSize);
    },
    enabled: !!voteId, // Only run query if voteId exists
  });
}

/**
 * Creates a new candidate.
 * @returns The created candidate data.
 */
export function useCreateCandidate() {
  return useMutation({
    mutationFn: async (data: CandidateCreate) => {
      const response =  await api.post("/v1/candidate/create", {
        question_id: parseInt(data.question_id, 10),
        name: data.name,
      });

      return response.data;
    }
  })
}