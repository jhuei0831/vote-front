import { defineStore } from "pinia";
import { apolloProvider } from "@/api/graphql";
import { CANDIDATE_VIEW } from "@/api/candidate";

export const useCandidateStore = defineStore("candidate", {
  actions: {
    async fetchCandidate(id) {
      if (!id) {
        console.error('id must defined');
        return;
      };
          
      try {
        const result = await apolloProvider.defaultClient.query({
          query: CANDIDATE_VIEW,
          variables: {
            id,
            withCandidates: false
          }
        });
        
        return result.data?.candidate;
      } catch (error) {
        console.error('Error fetching candidate:', error);
        throw error;
      } finally {
      }
    },
  },
});