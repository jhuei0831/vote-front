import { defineStore } from "pinia";
import { apolloProvider } from "@/api/apollo";
import { 
  POLL_OPTION_VIEW,
  POLL_OPTION_LIST,
  POLL_OPTION_CREATE, 
  POLL_OPTION_UPDATE
} from "@/graphql/pollOption";
import { computed, reactive } from "vue";

export interface PollOptionQueryResult {
  pollOptions: {
    edges: {
      node: {
        id: number;
        pollId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
      };
    }[];
    totalCount: number;
  }[];
}

export interface PollOptionState {
  uuid: string | null;
  id: number | null;
  isEdit: boolean;
  initialValues: {
    id?: number;
    pollId: number;
    name: string;
  };
  loadingInitial: boolean;
  submitting: boolean;
  error: any;
}

export const usePollOptionStore = defineStore("pollOption", () => {
  // State
  const state = reactive<PollOptionState>({
    uuid: null,
    id: null,
    isEdit: false,
    initialValues: {
      pollId: 0,
      name: ''
    },
    loadingInitial: false,
    submitting: false,
    error: null,
  });

  // Getters
  const modeLabel = computed(() => (state.isEdit ? 'Update' : 'Create'));

  // Actions
  async function init(uuid: PollOptionState['uuid'], id: PollOptionState['id']) {
    
    // Initialize: set mode & load initial values (only in edit mode)
    state.uuid = uuid ?? null
    state.id = id ?? null
    state.isEdit = !!id
    state.error = null

    if (!state.isEdit) {
      console.log('Create mode - setting empty initial values');
      state.initialValues = { pollId: 0, name: ''}
      return
    }

    console.log('Edit mode - fetching data for uuid:', uuid, 'and id:', id);
    state.loadingInitial = true
    
    try {
      const { data } = await apolloProvider.defaultClient.query({
        query: POLL_OPTION_VIEW,
        variables: {
          id
        },
        fetchPolicy: 'network-only',
      })
      
      const v = data?.pollOption
      
      state.initialValues = v
        ? { 
            pollId: v.pollId, 
            name: v.name
          }
        : { pollId: 0, name: '' }
        
      console.log('Final initialValues:', state.initialValues);
    } catch (e) {
      console.error('Error in init:', e);
      state.error = e
    } finally {
      state.loadingInitial = false
    }
  }

  async function submit(values: PollOptionState['initialValues']) {
    state.submitting = true
    state.error = null
    
    try {
      if (!state.isEdit) {
        // Create
        const res = await apolloProvider.defaultClient.mutate({
          mutation: POLL_OPTION_CREATE,
          variables: { 
            input: {
              pollId: values.pollId,
              name: values.name,
            }
          },
          refetchQueries: [
            {
              query: POLL_OPTION_LIST,
              variables: {
                input: {
                  sessionId: state.uuid,
                  first: 999
                },
              }
            }
          ]
        })
        return res.data?.createPollOption
      } else {
        // Update
        const res = await apolloProvider.defaultClient.mutate({
          mutation: POLL_OPTION_UPDATE,
          variables: { 
            id: state.id,
            input: {
              pollId: values.pollId,
              name: values.name,
            }
          },
          refetchQueries: [
            { 
              query: POLL_OPTION_LIST, 
              variables: {
                input: {
                  sessionId: state.uuid,
                  first: 999
                },
                withPollOptions: false  
              }
            },
            { 
              query: POLL_OPTION_VIEW, 
              variables: { 
                id: state.id,
                withPollOptions: false
              } 
            },
          ],
          optimisticResponse: {
            updatePollOption: { 
              __typename: 'PollOption',
              id: state.id, 
              pollId: values.pollId,
              name: values.name,
              createdAt: '',
              updatedAt: '',
            },
          }
        })
        return res.data?.updatePollOption
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
    state.initialValues = { pollId: 0, name: '' }
    state.loadingInitial = false
    state.submitting = false
    state.error = null
  }

  async function fetchPollOption(id: PollOptionState['id']) {
    if (!id) {
      console.error('id must defined');
      return;
    };
        
    try {
      const result = await apolloProvider.defaultClient.query({
        query: POLL_OPTION_VIEW,
        variables: {
          id
        }
      });
      
      return result.data?.pollOption;
    } catch (error) {
      console.error('Error fetching pollOption:', error);
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
    fetchPollOption,
  }
});