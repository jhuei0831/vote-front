import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { apolloProvider } from '@/api/apollo'
import { INVITATION_LIST, INVITATION_CREATE, INVITATION_UPDATE, INVITATION_DELETE } from '@/graphql/invitation'

export enum InvitationFormat {
  INT = 'int',
  EN = 'en',
  MIX = 'mix',
  MIX_EXCL = 'mixExcl',
  MIX_LOWER = 'mixLower',
  MIX_UPPER = 'mixUpper'
}

export interface InvitationQueryResult {
  invitations: {
    edges: {
      node: {
        id: number
        sessionId: number
        codeHash: string
        status: string
        createdAt: string
      }
      cursor: string
    }[]
    totalCount: number
  }[]
}

export interface InvitationState {
  uuid: string | null
  initialValues: {
    id?: number,
    codeHash?: string,
    number: number,
    length: number,
    format: string
  }
  loadingInitial: boolean
  submitting: boolean
  error: string | null
}

export const useInvitationStore = defineStore('invitation', () => {
  // State
  const state = reactive<InvitationState>({
    uuid: null,
    initialValues: {
      number: 0,
      length: 0,
      format: ''
    },
    loadingInitial: false,
    submitting: false,
    error: null,
  });

  // Actions
  async function init(uuid: InvitationState['uuid']) {
      
    // Initialize: set mode & load initial values (only in edit mode)
    state.uuid = uuid ?? null
    state.error = null

    console.log('Create mode - setting empty initial values');
    state.initialValues = { number: 0, length: 0, format: '' }
    return
  }

  async function submit(values: InvitationState['initialValues']) {
      state.submitting = true
      state.error = null
      
      try {
        const res = await apolloProvider.defaultClient.mutate({
          mutation: INVITATION_CREATE,
          variables: { 
            input: {
              sessionId: state.uuid,
              number: values.number,
              length: values.length,
              format: values.format
            }
          },
          refetchQueries: [
            {
              query: INVITATION_LIST,
              variables: {
                query: {
                  sessionId: state.uuid,
                  first: 999
                },
              }
            }
          ]
        })
        return res.data?.createInvitation
      } catch (e) {
        state.error = e instanceof Error ? e.message : String(e)
        throw e
      } finally {
        state.submitting = false
      }
    }

  async function create(sessionId: string, values: { number: number; length: number; format: string }) {
    state.submitting = true
    state.error = null
    
    try {
      const res = await apolloProvider.defaultClient.mutate({
        mutation: INVITATION_CREATE,
        variables: {
          input: {
            sessionId,
            number: values.number,
            length: values.length,
            format: values.format
          }
        }
      })
      return res.data?.createInvitation
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e)
      throw e
    } finally {
      state.submitting = false
    }
  }

  async function updateStatus(invitationId: number, sessionId: string, status: boolean) {
    try {
      await apolloProvider.defaultClient.mutate({
        mutation: INVITATION_UPDATE,
        variables: {
          ids: [invitationId],
          input: {
            sessionId,
            status
          }
        }
      })
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function batchUpdateStatus(invitationIds: number[], sessionId: string, status: boolean) {
    try {
      await apolloProvider.defaultClient.mutate({
        mutation: INVITATION_UPDATE,
        variables: {
          ids: invitationIds,
          input: {
            sessionId,
            status
          }
        }
      })
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  // Delete all selected invitations
  async function batchDeleteInvitations(invitationIds: number[]) {
    try {
      await apolloProvider.defaultClient.mutate({
        mutation: INVITATION_DELETE,
        variables: {
          ids: invitationIds,
        }
      })
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  function reset() {
    state.uuid = null
    state.initialValues = { number: 0, length: 0, format: '' }
    state.loadingInitial = false
    state.submitting = false
    state.error = null
  }

  return {
    state,
    init,
    submit,
    create,
    updateStatus,
    batchUpdateStatus,
    batchDeleteInvitations,
    reset
  }
})