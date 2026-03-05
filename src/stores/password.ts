import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { apolloProvider } from '@/api/apollo'
import { PASSWORD_LIST, PASSWORD_CREATE, PASSWORD_UPDATE, PASSWORD_DELETE } from '@/graphql/password'

export enum PasswordFormat {
  INT = 'int',
  EN = 'en',
  MIX = 'mix',
  MIX_EXCL = 'mixExcl',
  MIX_LOWER = 'mixLower',
  MIX_UPPER = 'mixUpper'
}

export interface PasswordQueryResult {
  passwords: {
    edges: {
      node: {
        id: number
        voteId: number
        password: string
        status: string
        createdAt: string
      }
      cursor: string
    }[]
    totalCount: number
  }[]
}

export interface PasswordState {
  uuid: string | null
  initialValues: {
    id?: number,
    password?: string,
    number: number,
    length: number,
    format: string
  }
  loadingInitial: boolean
  submitting: boolean
  error: string | null
}

export const usePasswordStore = defineStore('password', () => {
  // State
  const state = reactive<PasswordState>({
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
  async function init(uuid: PasswordState['uuid']) {
      
    // Initialize: set mode & load initial values (only in edit mode)
    state.uuid = uuid ?? null
    state.error = null

    console.log('Create mode - setting empty initial values');
    state.initialValues = { number: 0, length: 0, format: '' }
    return
  }

  async function submit(values: PasswordState['initialValues']) {
      state.submitting = true
      state.error = null
      
      try {
        const res = await apolloProvider.defaultClient.mutate({
          mutation: PASSWORD_CREATE,
          variables: { 
            input: {
              voteId: state.uuid,
              number: values.number,
              length: values.length,
              format: values.format
            }
          },
          refetchQueries: [
            {
              query: PASSWORD_LIST,
              variables: {
                query: {
                  voteId: state.uuid,
                  first: 999
                },
              }
            }
          ]
        })
        return res.data?.createPassword
      } catch (e) {
        state.error = e instanceof Error ? e.message : String(e)
        throw e
      } finally {
        state.submitting = false
      }
    }

  async function create(voteId: string, values: { number: number; length: number; format: string }) {
    state.submitting = true
    state.error = null
    
    try {
      const res = await apolloProvider.defaultClient.mutate({
        mutation: PASSWORD_CREATE,
        variables: {
          input: {
            voteId,
            number: values.number,
            length: values.length,
            format: values.format
          }
        }
      })
      return res.data?.createPassword
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e)
      throw e
    } finally {
      state.submitting = false
    }
  }

  async function updateStatus(passwordId: number, voteId: string, status: boolean) {
    try {
      await apolloProvider.defaultClient.mutate({
        mutation: PASSWORD_UPDATE,
        variables: {
          ids: [passwordId],
          input: {
            voteId,
            status
          }
        }
      })
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function batchUpdateStatus(passwordIds: number[], voteId: string, status: boolean) {
    try {
      await apolloProvider.defaultClient.mutate({
        mutation: PASSWORD_UPDATE,
        variables: {
          ids: passwordIds,
          input: {
            voteId,
            status
          }
        }
      })
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  // Delete all selected passwords
  async function batchDeletePasswords(passwordIds: number[]) {
    try {
      await apolloProvider.defaultClient.mutate({
        mutation: PASSWORD_DELETE,
        variables: {
          ids: passwordIds,
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
    batchDeletePasswords,
    reset
  }
})