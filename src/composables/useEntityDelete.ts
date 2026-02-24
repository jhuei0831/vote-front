import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { apolloProvider } from '@/api/apollo'
import type { DocumentNode } from 'graphql'

interface UseEntityDeleteOptions<T> {
  mutation: DocumentNode
  entityName: string
  getDisplayName: (entity: T) => string
  getDeleteVariables: (entity: T) => Record<string, any>
  onSuccess?: () => void | Promise<void>
}

export function useEntityDelete<T>(options: UseEntityDeleteOptions<T>) {
  const toast = useToast()
  const deleteDialog = ref(false)
  const entity = ref<T | null>(null)

  function confirmDelete(entityData: T) {
    entity.value = entityData
    deleteDialog.value = true
  }

  async function executeDelete() {
    if (!entity.value) return

    try {
      await apolloProvider.defaultClient.mutate({
        mutation: options.mutation,
        variables: options.getDeleteVariables(entity.value)
      })

      if (options.onSuccess) {
        await options.onSuccess()
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${options.entityName} deleted successfully.`,
        life: 3000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${options.entityName}.`
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000
      })
      console.error(`Error deleting ${options.entityName}:`, error)
    } finally {
      deleteDialog.value = false
      entity.value = null
    }
  }

  return {
    deleteDialog,
    entity,
    confirmDelete,
    executeDelete,
    getDisplayName: () => entity.value ? options.getDisplayName(entity.value) : ''
  }
}
