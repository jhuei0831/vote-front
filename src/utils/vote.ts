import api from "@/utils/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
 * Handles the deletion of a vote.
 * @param id The ID of the vote to delete.
 */
export async function handleDelete(id: string) {
  if (confirm("Are you sure you want to delete this vote?")) {
    try {
      const response = await api.delete(`/v1/vote/`, { data: [id] });
      alert(response.data.msg);
      window.location.reload();
    } catch (err) {
      alert("Failed to delete vote.");
      console.log(err);
    }
  }
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
  });
}