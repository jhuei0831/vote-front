import { computed, reactive, ref } from 'vue';

import { defineStore } from 'pinia';

import { apolloProvider } from '@/api/apollo';
import { SESSION_CREATE, SESSION_LIST, SESSION_UPDATE, SESSION_VIEW } from '@/graphql/session';

export interface SessionQueryResult {
  sessions: {
    edges: {
      node: {
        uuid: string;
        title: string;
        description: string;
        status: number;
        startTime: string | null;
        endTime: string | null;
        creator: {
          uuid: string;
          name: string;
        };
      };
    }[];
    totalCount: number;
  }[];
}

export interface SessionState {
  uuid: string | null;
  isEdit: boolean;
  initialValues: {
    uuid?: string;
    title: string;
    description: string;
    status?: number;
    startTime: Date | null;
    endTime: Date | null;
  };
  loadingInitial: boolean;
  submitting: boolean;
  error: any;
}

export const useSessionStore = defineStore('session', () => {
  // State
  const session = ref<SessionState['initialValues'] | null>(null);
  const state = reactive<SessionState>({
    uuid: null,
    isEdit: false,
    initialValues: {
      title: '',
      description: '',
      startTime: null,
      endTime: null
    } ,
    loadingInitial: false,
    submitting: false,
    error: null,
  });

  // Getters
  const sessionExists = computed(() => {
    if (!session.value) return false;
    if (Array.isArray(session.value)) {
      return session.value.length > 0;
    }
    return typeof session.value === 'object' && Object.keys(session.value).length > 0;
  });

  const modeLabel = computed(() => (state.isEdit ? 'Update' : 'Create'))

  // Actions
  function setCurrentSession(newSession: SessionState['initialValues'] | null) {
    session.value = newSession;
  }
  
  async function init(uuid: SessionState['uuid']) {
    // Initialize: set mode & load initial values (only in edit mode)
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
        query: SESSION_VIEW,
        variables: {
          uuid,
          withPolls: false
        },
        fetchPolicy: 'network-only',
      })
      
      const v = data?.session
      
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

  async function submit(values: SessionState['initialValues']) {
    state.submitting = true
    state.error = null
    try {
      if (!state.isEdit) {
        // Create
        const res = await apolloProvider.defaultClient.mutate({
          mutation: SESSION_CREATE,
          variables: { 
            input: {
              title: values.title,
              description: values.description,
              startTime: values.startTime ? values.startTime.toISOString() : null,
              endTime: values.endTime ? values.endTime.toISOString() : null
            } 
          },
          refetchQueries: [
            {
              query: SESSION_LIST,
              variables: {
                withPolls: false
              }
            }
          ]
        })
        return res.data?.createSession
      } else {
        // Update
        const res = await apolloProvider.defaultClient.mutate({
          mutation: SESSION_UPDATE,
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
            { query: SESSION_LIST, variables: { withPolls: false } },
            { query: SESSION_VIEW, variables: { uuid: state.uuid, withPolls: false } },
          ],
          optimisticResponse: {
            updateSession: { __typename: 'Session', uuid: state.uuid, ...values },
          }
        })
        return res.data?.updateSession
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

  async function fetchSessionByUuid(uuid: SessionState['uuid']) {
    if (!uuid) return;
    
    try {
      const result = await apolloProvider.defaultClient.query({
        query: SESSION_VIEW,
        variables: {
          uuid,
          withPolls: false
        }
      });

      if (result.data?.session) {
        session.value = result.data.session;
      }
      
      return result.data?.session;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  }

  function clearSession() {
    session.value = null;
  }

  return {
    // state
    session,
    state,
    // getters
    sessionExists,
    modeLabel,
    // actions
    setCurrentSession,
    init,
    submit,
    reset,
    fetchSessionByUuid,
    clearSession,
  };
});