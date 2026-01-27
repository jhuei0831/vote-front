import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { apolloProvider } from '@/api/apollo';
import { VOTE_VIEW, VOTE_LIST, VOTE_CREATE, VOTE_UPDATE } from '@/graphql/vote';

export const useVoteStore = defineStore('vote', () => {
  // State
  const vote = ref(null);
  const state = reactive({
    uuid: null,
    isEdit: false,
    initialValues: {
      title: '',
      description: '',
      startTime: null,
      endTime: null
    },
    loadingInitial: false,
    submitting: false,
    error: null,
  });

  // Getters
  const voteExists = computed(() => {
    if (!vote.value) return false;
    if (Array.isArray(vote.value)) {
      return vote.value.length > 0;
    }
    return typeof vote.value === 'object' && Object.keys(vote.value).length > 0;
  });

  const modeLabel = computed(() => (state.isEdit ? 'Update' : 'Create'))

  // Actions
  function setCurrentVote(newVote) {
    vote.value = newVote;
  }
  
  async function init(uuid) {
    // 初始化：設定模式 & 讀取初值（只在編輯模式）
    console.log('Init called with uuid:', uuid);
    state.uuid = uuid ?? null
    state.isEdit = !!uuid
    state.error = null

    if (!state.isEdit) {
      console.log('Create mode - setting empty initial values');
      state.initialValues = { title: '', description: '', startTime: null, endTime: null }
      return
    }

    console.log('Edit mode - fetching data for uuid:', uuid);
    state.loadingInitial = true
    
    try {
      const { data } = await apolloProvider.defaultClient.query({
        query: VOTE_VIEW,
        variables: {
          uuid,
          withQuestions: false
        },
        fetchPolicy: 'network-only',
      })
      
      console.log('GraphQL response:', data);
      const v = data?.vote
      console.log('Vote data:', v);
      
      state.initialValues = v
        ? { 
            title: v.title, 
            description: v.description, 
            startTime: v.startTime ? new Date(v.startTime) : null, 
            endTime: v.endTime ? new Date(v.endTime) : null 
          }
        : { title: '', description: '', startTime: null, endTime: null }
        
      console.log('Final initialValues:', state.initialValues);
    } catch (e) {
      console.error('Error in init:', e);
      state.error = e
    } finally {
      state.loadingInitial = false
    }
  }

  async function submit(values) {
    state.submitting = true
    state.error = null
    try {
      if (!state.isEdit) {
        // Create
        const res = await apolloProvider.defaultClient.mutate({
          mutation: VOTE_CREATE,
          variables: { 
            input: {
              title: values.title,
              description: values.description,
              startTime: values.startTime ? values.startTime.toISOString() : null,
              endTime: values.endTime ? values.endTime.toISOString() : null
            } 
          }
        })
        return res.data?.createVote
      } else {
        // Update
        const res = await apolloProvider.defaultClient.mutate({
          mutation: VOTE_UPDATE,
          variables: { 
            uuid: state.uuid,
            input: {
              title: values.title,
              description: values.description,
              startTime: values.startTime ? values.startTime.toISOString() : null,
              endTime: values.endTime ? values.endTime.toISOString() : null
            }
          },
          refetchQueries: [
            { query: VOTE_LIST, variables: { withQuestions: false } },
            { query: VOTE_VIEW, variables: { uuid: state.uuid, withQuestions: false } },
          ],
          optimisticResponse: {
            updateVote: { __typename: 'Vote', uuid: state.uuid, ...values },
          }
        })
        return res.data?.updateVote
      }
    } catch (e) {
      state.error = e
      throw e
    } finally {
      state.submitting = false
    }
  }

  function reset() {
    state.uuid = null
    state.isEdit = false
    state.initialValues = { title: '', description: '', startTime: null, endTime: null }
    state.loadingInitial = false
    state.submitting = false
    state.error = null
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
    // state
    vote,
    state,
    // getters
    voteExists,
    modeLabel,
    // actions
    setCurrentVote,
    init,
    submit,
    reset,
    fetchVoteByUuid,
    clearVote,
  };
});