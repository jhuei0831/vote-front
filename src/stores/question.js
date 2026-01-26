import { defineStore } from "pinia";
import { apolloProvider } from "@/api/graphql";
import { QUESTION_VIEW, QUESTION_OPTIONS } from "@/api/question";

export const useQuestionStore = defineStore("question", {
  state: () => ({
    questions: [],
  }),
  getters: {
    questionOptions() {
      return this.questions.map(question => ({
        label: question.title,
        value: question.id
      }));
    },
    questionMap() {
      return new Map(
        this.questions.map(q => [q.id, q.title])
      );
    }
  },
  actions: {
    async fetchQuestion(id) {
      if (!id) return;
          
      try {
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
      }
    },
    async fetchQuestionOptions(uuid) {
      if (!uuid) return;
          
      try {
        const result = await apolloProvider.defaultClient.query({
          query: QUESTION_OPTIONS,
          variables: {
            voteId: uuid,
          },
          fetchPolicy: 'network-only',
        });
        
        this.questions = result.data?.questionOptions?.options;
      } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
    }
  },
});