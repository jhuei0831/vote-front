import { defineStore } from "pinia";
import { apolloProvider } from "@/api/graphql";
import { QUESTION_VIEW } from "@/api/question";

export const useQuestionStore = defineStore("question", {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    async fetchQuestion(id) {
      if (!id) return;
          
      try {
        this.isLoading = true;
        const result = await apolloProvider.defaultClient.query({
          query: QUESTION_VIEW,
          variables: {
            id,
            withCandidates: false
          }
        });
        
        return result.data?.question;
      } catch (error) {
        console.error('Error fetching question:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});