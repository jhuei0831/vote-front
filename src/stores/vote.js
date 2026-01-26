import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apolloProvider } from '@/api/graphql';
import { VOTE_VIEW } from '@/api/vote';

export const useVoteStore = defineStore('vote', () => {
  // State
  const vote = ref(null);

  // Getters
  const voteExists = computed(() => {
    if (!vote.value) return false;
    if (Array.isArray(vote.value)) {
      return vote.value.length > 0;
    }
    return typeof vote.value === 'object' && Object.keys(vote.value).length > 0;
  });

  // Actions
  function setCurrentVote(newVote) {
    vote.value = newVote;
  }

  async function fetchVoteByUuid(uuid) {
    if (!uuid) return;
    
    try {
      const result = await apolloProvider.defaultClient.query({
        query: VOTE_VIEW,
        variables: {
          uuid,
          withQuestions: false
        }
      });

      if (result.data?.vote) {
        vote.value = result.data.vote;
      }
      
      return result.data?.vote;
    } catch (error) {
      console.error('Error fetching vote:', error);
      throw error;
    }
  }

  function clearVote() {
    vote.value = null;
  }

  return {
    vote,
    voteExists,
    setCurrentVote,
    fetchVoteByUuid,
    clearVote,
  };
});