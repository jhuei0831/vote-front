import { defineStore } from "pinia";
import { apolloProvider } from "@/api/apollo";
import { 
  CANDIDATE_VIEW,
  CANDIDATE_LIST,
  CANDIDATE_CREATE, 
  CANDIDATE_UPDATE
} from "@/graphql/candidate";
import { computed, reactive } from "vue";

export const useCandidateStore = defineStore("candidate", () => {
  // State
  const state = reactive({
    uuid: null,
    id: null,
    isEdit: false,
    initialValues: {
      questionId: 0,
      name: ''
    },
    loadingInitial: false,
    submitting: false,
    error: null,
  });

  // Getters
  const modeLabel = computed(() => (state.isEdit ? 'Update' : 'Create'));

  // Actions
  async function init(uuid, id) {
    
    // Initialize: set mode & load initial values (only in edit mode)
    state.uuid = uuid ?? null
    state.id = id ?? null
    state.isEdit = !!id
    state.error = null

    if (!state.isEdit) {
      console.log('Create mode - setting empty initial values');
      state.initialValues = { questionId: 0, name: ''}
      return
    }

    console.log('Edit mode - fetching data for uuid:', uuid, 'and id:', id);
    state.loadingInitial = true
    
    try {
      const { data } = await apolloProvider.defaultClient.query({
        query: CANDIDATE_VIEW,
        variables: {
          id
        },
        fetchPolicy: 'network-only',
      })
      
      const v = data?.candidate
      
      state.initialValues = v
        ? { 
            questionId: v.questionId, 
            name: v.name
          }
        : { questionId: 0, name: '' }
        
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
          mutation: CANDIDATE_CREATE,
          variables: { 
            input: {
              questionId: values.questionId,
              name: values.name,
            }
          },
          refetchQueries: [
            {
              query: CANDIDATE_LIST,
              variables: {
                query: {
                  voteId: state.uuid,
                  first: 999
                },
              }
            }
          ]
        })
        return res.data?.createCandidate
      } else {
        // Update
        const res = await apolloProvider.defaultClient.mutate({
          mutation: CANDIDATE_UPDATE,
          variables: { 
            id: state.id,
            input: {
              questionId: values.questionId,
              name: values.name,
            }
          },
          refetchQueries: [
            { 
              query: CANDIDATE_LIST, 
              variables: {
                query: {
                  voteId: state.uuid,
                  first: 999
                },
                withCandidates: false  
              }
            },
            { 
              query: CANDIDATE_VIEW, 
              variables: { 
                id: state.id,
                withCandidates: false
              } 
            },
          ],
          optimisticResponse: {
            updateCandidate: { 
              __typename: 'Candidate',
              id: state.id, 
              questionId: values.questionId,
              name: values.name,
              createdAt: '',
              updatedAt: '',
            },
          }
        })
        return res.data?.updateCandidate
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
    state.id = null
    state.isEdit = false
    state.initialValues = { questionId: 0, name: '' }
    state.loadingInitial = false
    state.submitting = false
    state.error = null
  }

  async function fetchCandidate(id) {
    if (!id) {
      console.error('id must defined');
      return;
    };
        
    try {
      const result = await apolloProvider.defaultClient.query({
        query: CANDIDATE_VIEW,
        variables: {
          id
        }
      });
      
      return result.data?.candidate;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      throw error;
    } 
  }

  return {
    // state
    state,
    // getters
    modeLabel,
    // actions
    init,
    submit,
    reset,
    fetchCandidate,
  }
});