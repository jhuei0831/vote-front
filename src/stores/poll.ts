import { ref, reactive, computed } from "vue";
import { defineStore } from "pinia";
import { apolloProvider } from "@/api/apollo";
import { 
  POLL_VIEW, 
  POLL_LIST, 
  POLL_CREATE, 
  POLL_UPDATE,
  POLL_SELECT_LIST 
} from "@/graphql/poll";

export interface PollQueryResult {
  polls: {
    edges: {
      node: {
        id: number;
        title: string;
        description: string;
        createdAt: string;
        updatedAt: string;
      };
    }[];
    totalCount: number;
  }[];
}

export interface PollState {
  uuid: string | null;
  id: number | null;
  isEdit: boolean;
  initialValues: {
    id?: number;
    title: string;
    description: string;
  };
  loadingInitial: boolean;
  submitting: boolean;
  error: any;
}

export const usePollStore = defineStore("poll", () => {
  // State
  const polls = ref<PollState['initialValues'][]>([]);
  const state = reactive<PollState>({
    uuid: null,
    id: null,
    isEdit: false,
    initialValues: {
      title: '',
      description: ''
    },
    loadingInitial: false,
    submitting: false,
    error: null,
  });

  // Getters
  const pollOptions = computed(() => {
    return polls.value.map((poll: PollState['initialValues']) => ({
      label: poll.title,
      value: poll.id
    }));
  });

  const pollMap = computed(() => {
    return new Map(
      polls.value.map(q => [q.id, q.title])
    );
  });

  const modeLabel = computed(() => (state.isEdit ? 'Update' : 'Create'))

  // Actions
  async function init(uuid: PollState['uuid'], id: PollState['id']) {
    // Initialize: set mode & load initial values (only in edit mode)
    state.uuid = uuid ?? null
    state.id = id ?? null
    state.isEdit = !!id
    state.error = null

    if (!state.isEdit) {
      console.log('Create mode - setting empty initial values');
      state.initialValues = { title: '', description: ''}
      return
    }

    console.log('Edit mode - fetching data for uuid:', uuid, 'and id:', id);
    state.loadingInitial = true
    
    try {
      const { data } = await apolloProvider.defaultClient.query({
        query: POLL_VIEW,
        variables: {
          id,
          withPollOptions: false
        },
        fetchPolicy: 'network-only',
      })
      
      const v = data?.poll
      
      state.initialValues = v
        ? { 
            title: v.title, 
            description: v.description
          }
        : { title: '', description: '' }
        
      console.log('Final initialValues:', state.initialValues);
    } catch (e) {
      console.error('Error in init:', e);
      state.error = e
    } finally {
      state.loadingInitial = false
    }
  }

  async function submit(values: PollState['initialValues']) {
    state.submitting = true
    state.error = null
    try {
      if (!state.isEdit) {
        // Create
        const res = await apolloProvider.defaultClient.mutate({
          mutation: POLL_CREATE,
          variables: { 
            input: {
              sessionId: state.uuid,
              title: values.title,
              description: values.description,
            }
          },
          refetchQueries: [
            {
              query: POLL_LIST,
              variables: {
                input: {
                  sessionId: state.uuid,
                  first: 999
                },
                withPollOptions: false  
              }
            }
          ]
        })
        return res.data?.createPoll
      } else {
        // Update
        const res = await apolloProvider.defaultClient.mutate({
          mutation: POLL_UPDATE,
          variables: { 
            id: state.id,
            input: {
              sessionId: state.uuid,
              title: values.title,
              description: values.description,
            }
          },
          refetchQueries: [
            { 
              query: POLL_LIST, 
              variables: {
                input: {
                  sessionId: state.uuid,
                  first: 999
                },
                withPollOptions: false  
              }
            },
            { 
              query: POLL_VIEW, 
              variables: { 
                id: state.id,
                withPollOptions: false
              } 
            },
          ],
          optimisticResponse: {
            updatePoll: { 
              __typename: 'Poll',
              id: state.id, 
              sessionId: state.uuid,
              title: values.title, 
              description: values.description,
              createdAt: '',
              updatedAt: '',
            },
          }
        })
        return res.data?.updatePoll
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
    state.initialValues = { title: '', description: '' }
    state.loadingInitial = false
    state.submitting = false
    state.error = null
  }

  async function fetchPoll(id: PollState['id']) {
    if (!id) return;
        
    try {
      const result = await apolloProvider.defaultClient.query({
        query: POLL_VIEW,
        variables: {
          id,
          withPollOptions: false
        }
      });
      
      return result.data?.poll;
    } catch (error) {
      console.error('Error fetching poll:', error);
      throw error;
    } finally {
    }
  }

  async function fetchPollList(uuid: PollState['uuid']) {
    if (!uuid) return;
        
    try {
      const result = await apolloProvider.defaultClient.query({
        query: POLL_SELECT_LIST,
        variables: {
          sessionId: uuid,
        },
        fetchPolicy: 'network-only',
      });
      
      polls.value = result.data?.pollList?.list;
    } catch (error) {
      console.error('Error fetching poll list:', error);
      throw error;
    }
  }

  return {
    // state
    polls,
    state,
    // getters
    modeLabel,
    pollOptions,
    pollMap,
    // actions
    init,
    submit,
    reset,
    fetchPoll,
    fetchPollList,
  };
});