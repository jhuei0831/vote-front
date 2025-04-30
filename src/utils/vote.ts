import api from "@/utils/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Vote data type
 * @typedef {Object} Vote
 * @property {string} id - The ID of the vote.
 * @property {string} title - The title of the vote.
 * @property {string} description - The description of the vote.
 * @property {string} start_time - The start time of the vote.
 * @property {string} end_time - The end time of the vote.
 */
export type Vote = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
};

/**
 * Fetches a list of votes.
 * @param page The page number to fetch.
 * @param size The number of votes per page.
 * @returns The fetched votes data.
 */
export async function fetchVotes(page: number, size: number) {
  try {
    const response = await api.get("/v1/vote/list", { params: { page, size } });
    return response.data;
  } catch (err) {
    console.error(err);
    return { data: [], pagination: { total: 0, total_pages: 0 } };
  }
}

/**
 * Fetches a vote by its ID.
 * @param id The ID of the vote to fetch.
 * @returns 
 */
export async function fetchVote(id: string) {
  try {
    const response = await api.get(`/v1/vote/${id}`);
    return response.data.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Handles the creation of a new vote.
 * @returns Mutation function for creating votes.
 */
export function useCreateVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; startTime: string; endTime: string }) => {
      const response = await api.post("/v1/vote/create", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the votes list query to refetch after creation
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      alert(data.msg);
    },
    onError: (error) => {
      alert("Failed to create vote.");
      console.error(error);
    }
  });
}

/**
 * Handles the deletion of a vote.
 * @param id The ID of the vote to delete.
 */
/**
 * Hook to handle vote deletion using React Query.
 * @returns Mutation function for deleting votes.
 */
export function useDeleteVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/v1/vote/`, { data: [id] });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the votes list query to refetch after deletion
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      alert(data.msg);
    },
    onError: (error) => {
      alert("Failed to delete vote.");
      console.error(error);
    }
  });
}

/**
 * Fetches a list of votes with pagination.
 * @param pageIndex 
 * @param pageSize 
 * @param p0 
 * @returns 
 */
export function useVotes(pageIndex: number, pageSize: number, p0: { onSuccess: (response: any) => void; }) {
  return useQuery({
    queryKey: ["votes", pageIndex, pageSize],
    queryFn: async () => {
      // Only fetch if pageIndex and pageSize are valid
      if (pageIndex < 0 || pageSize <= 0) return { data: [], pagination: { total: 0, total_pages: 0 } };
      const response = await fetchVotes(pageIndex, pageSize);
      p0.onSuccess(response);      
      return response.data;
    },
    enabled: pageIndex >= 0 && pageSize > 0, // Only run query if pageIndex and pageSize are valid
    staleTime: 60000, // 1分鐘內不會重新請求
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

/**
 * Fetches a vote by its ID.
 * @param id The ID of the vote to fetch.
 * @returns The fetched vote data or null if not found.
 */
export function useVoteById(id: string) {
  return useQuery({
    queryKey: ["vote", id],
    queryFn: () => {
      console.log(`實際發送請求獲取 Vote ${id}`);
      return fetchVote(id); // Added return statement to ensure Promise is returned
    },
    enabled: !!id,
    staleTime: 60000, // 1分鐘內不會重新請求
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}