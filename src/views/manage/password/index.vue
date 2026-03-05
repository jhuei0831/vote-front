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
      <Button 
        v-if="selectedPasswords.length > 0"
        label="Delete Selected" 
        icon="pi pi-trash" 
        severity="danger"
        @click="confirmBatchDeletePasswords()"
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
            <div class="flex items-center gap-2">
              <Button
                :icon="decryptedPasswords.has(slotProps.data.id) ? 'pi pi-eye-slash' : 'pi pi-eye'"
                text
                rounded
                size="small"
                severity="secondary"
                @click="togglePasswordVisibility(slotProps.data)"
                class="hover:bg-gray-100"
              />
              <span class="font-mono">
                {{ decryptedPasswords.has(slotProps.data.id) ? decryptedPasswords.get(slotProps.data.id) : slotProps.data.password }}
              </span>
            </div>
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
    <ConfirmDialog></ConfirmDialog>
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
import ConfirmDialog from 'primevue/confirmdialog';
import { useToast } from 'primevue/usetoast'
import { useConfirm } from "primevue/useconfirm";
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'

import { useEntityList } from '@/composables/useEntityList'
import { useEntityDelete } from '@/composables/useEntityDelete'
import { PASSWORD_LIST, PASSWORD_DELETE, PASSWORD_DECRYPT } from '@/graphql/password'
import { PasswordFormat, PasswordQueryResult, PasswordState, usePasswordStore } from '@/stores/password'
import { apolloProvider } from '@/api/apollo'
import { formatDate } from '@/utils/date'
import PasswordForm from '@/components/password/Form.vue'

const props = defineProps(['uuid'])
const toast = useToast()
const confirm = useConfirm()
const passwordStore = usePasswordStore()

// Selection state
const selectedPasswords = ref<any[]>([])

// Decrypted passwords cache
const decryptedPasswords = ref<Map<number, string>>(new Map())

// Create dialog state
const createDialogVisible = ref(false)
const initialValues = ref({
  number: 1,
  length: 6,
  format: PasswordFormat.MIX
})

// Form resolver
const resolver = ref(zodResolver(
  z.object({
    number: z.number().min(1, 'Number must be at least 1'),
    length: z.number().min(4, 'Length must be at least 4').max(32, 'Length must be at most 32'),
    format: z.enum([
      PasswordFormat.INT, 
      PasswordFormat.EN, 
      PasswordFormat.MIX, 
      PasswordFormat.MIX_EXCL, 
      PasswordFormat.MIX_LOWER, 
      PasswordFormat.MIX_UPPER
    ], {
      message: 'Please select a format'
    })
  })
))

function openCreateDialog() {
  createDialogVisible.value = true
  initialValues.value = {
    number: 1,
    length: 6,
    format: PasswordFormat.MIX
  }
}

// Handle form submission for creating new passwords
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

// Toggle password status (active/inactive)
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

// Toggle password visibility (decrypt/encrypt)
async function togglePasswordVisibility(password: any) {
  try {
    // If already decrypted, hide it
    if (decryptedPasswords.value.has(password.id)) {
      decryptedPasswords.value.delete(password.id)
      return
    }
    
    // Otherwise, decrypt it
    const result = await apolloProvider.defaultClient.query({
      query: PASSWORD_DECRYPT,
      variables: {
        password: password.password
      }
    })
    
    const decrypted = result.data?.decryptPassword
    if (decrypted) {
      decryptedPasswords.value.set(password.id, decrypted)
    }
  } catch (e) {
    console.error('Decrypt error:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Error decrypting password',
      life: 3000
    })
  }
}

// Batch update status for selected passwords
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

const confirmBatchDeletePasswords = () => {
  if (selectedPasswords.value.length === 0) return
  confirm.require({
    message: 'Are you sure you want to delete the selected passwords?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      variant: 'text'
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: async () => {
      const ids = selectedPasswords.value.map((p: any) => p.id)
      await passwordStore.batchDeletePasswords(ids)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${selectedPasswords.value.length} password(s) deleted successfully`,
        life: 3000
      })
      
      selectedPasswords.value = []
      await refetch()
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    }
  });
}

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