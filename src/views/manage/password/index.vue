<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Passwords</h1>
    <div class="flex gap-2 mb-4">
      <Button 
        label="Create New Password" 
        icon="pi pi-plus" 
        @click="openCreateDialog"
      />
      <Button 
        v-if="selectedPasswords.length > 0"
        label="Activate Selected" 
        icon="pi pi-check" 
        severity="success"
        @click="batchUpdateStatus(true)"
      />
      <Button 
        v-if="selectedPasswords.length > 0"
        label="Deactivate Selected" 
        icon="pi pi-times" 
        severity="warning"
        @click="batchUpdateStatus(false)"
      />
    </div>
    
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-lg text-gray-600">Loading...</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="text-red-800">An error occurred</div>
    </div>

    <!-- Result -->
    <div v-else-if="passwords && passwords.length > 0" class="result apollo">
      <DataTable 
        v-model:selection="selectedPasswords"
        :value="passwords" 
        striped-rows
        scrollable
        scroll-height="flex"
        responsive-layout="scroll"
        paginator
        :rows="5"
        :total-records="totalCount"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rows-per-page-options="[5, 10, 20, 50]"
      >
        <Column selection-mode="multiple" header-style="width: 3rem" :exportable="false"></Column>
        <Column field="id" header="ID" :sortable="true"></Column>
        <Column field="password" header="Password" :sortable="true">
          <template #body="slotProps">
            {{ slotProps.data.password }}
          </template>
        </Column>
        <Column field="status" header="Status" :sortable="true">
          <template #body="slotProps">
            <span 
              @click="toggleStatus(slotProps.data)"
              class="cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-colors"
              :class="slotProps.data.status ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'"
            >
              {{ slotProps.data.status ? 'Active' : 'Inactive' }}
            </span>
          </template>
        </Column>
        <Column field="createdAt" header="Created At" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column :exportable="false">
          <template #body="slotProps">
            <Button icon="pi pi-trash" variant="outlined" rounded severity="danger"
              @click="confirmDeletePassword(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No result -->
    <div v-else class="p-6 text-center text-gray-500">
      <div class="text-lg">No passwords found</div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deletePasswordDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="password">Are you sure you want to delete <b>{{ getDisplayName() }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deletePasswordDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deletePassword" severity="danger" />
      </template>
    </Dialog>

    <!-- Create Password Dialog -->
    <PasswordForm
      v-model:visible="createDialogVisible"
      :initialValues="initialValues"
      :submitting="passwordStore.state.submitting"
      :resolver="resolver"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'

import { useEntityList } from '@/composables/useEntityList'
import { useEntityDelete } from '@/composables/useEntityDelete'
import { PASSWORD_LIST, PASSWORD_DELETE } from '@/graphql/password'
import { PasswordQueryResult, PasswordState, usePasswordStore } from '@/stores/password'
import { formatDate } from '@/utils/date'
import PasswordForm from '@/components/password/Form.vue'

const props = defineProps(['uuid'])
const toast = useToast()
const passwordStore = usePasswordStore()

// Selection state
const selectedPasswords = ref<any[]>([])

// Create dialog state
const createDialogVisible = ref(false)
const initialValues = ref({
  number: 1,
  length: 8,
  format: 'mix'
})

// Form resolver
const resolver = ref(zodResolver(
  z.object({
    number: z.number().min(1, 'Number must be at least 1'),
    length: z.number().min(4, 'Length must be at least 4').max(32, 'Length must be at most 32'),
    format: z.enum(['int', 'en', 'mix', 'mixExcl', 'mixLower', 'mixUpper'], {
      message: 'Please select a format'
    })
  })
))

function openCreateDialog() {
  createDialogVisible.value = true
  initialValues.value = {
    number: 1,
    length: 8,
    format: 'mix'
  }
}

async function handleSubmit({ valid, values }: { valid: boolean; values: any }) {
  if (!valid) return
  
  try {
    await passwordStore.create(props.uuid, values)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password created successfully',
      life: 3000
    })
    
    createDialogVisible.value = false
    await refetch()
  } catch (e) {
    console.error('Submit error:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Error creating password',
      life: 3000
    })
  }
}

async function toggleStatus(password: any) {
  try {
    const newStatus = !password.status
    await passwordStore.updateStatus(password.id, props.uuid, newStatus)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Password ${newStatus ? 'activated' : 'deactivated'} successfully`,
      life: 3000
    })
    
    await refetch()
  } catch (e) {
    console.error('Toggle status error:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Error updating password status',
      life: 3000
    })
  }
}

async function batchUpdateStatus(status: boolean) {
  if (selectedPasswords.value.length === 0) return
  
  try {
    const ids = selectedPasswords.value.map((p: any) => p.id)
    await passwordStore.batchUpdateStatus(ids, props.uuid, status)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${selectedPasswords.value.length} password(s) ${status ? 'activated' : 'deactivated'} successfully`,
      life: 3000
    })
    
    selectedPasswords.value = []
    await refetch()
  } catch (e) {
    console.error('Batch update error:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Error updating passwords',
      life: 3000
    })
  }
}

const { loading, error, refetch, items: passwords, totalCount } = useEntityList<PasswordQueryResult, any>({
  query: PASSWORD_LIST,
  variables: {
    input: {
      voteId: props.uuid,
      first: 999
    },
    withQuestions: false
  },
  extractEdges: (result) => result?.passwords?.[0]?.edges,
  getTotalCount: (result) => result?.passwords?.[0]?.totalCount ?? 0
})

const {
  deleteDialog: deletePasswordDialog,
  entity: password,
  confirmDelete: confirmDeletePassword,
  executeDelete: deletePassword,
  getDisplayName
} = useEntityDelete<PasswordState['initialValues']>({
  mutation: PASSWORD_DELETE,
  entityName: 'Password',
  getDisplayName: (password) => password.password ?? 'this password',
  getDeleteVariables: (password) => ({ ids: [password.id] }),
  onSuccess: async () => { await refetch() }
})
</script>