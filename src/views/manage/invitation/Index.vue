<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Invitations</h1>
    <div class="flex gap-2 mb-4">
      <Button 
        label="Create New Invitation" 
        icon="pi pi-plus" 
        @click="openCreateDialog"
      />
      <Button 
        v-if="selectedInvitations.length > 0"
        label="Activate Selected" 
        icon="pi pi-check" 
        severity="success"
        @click="batchUpdateStatus(true)"
      />
      <Button 
        v-if="selectedInvitations.length > 0"
        label="Deactivate Selected" 
        icon="pi pi-times" 
        severity="warning"
        @click="batchUpdateStatus(false)"
      />
      <Button 
        v-if="selectedInvitations.length > 0"
        label="Delete Selected" 
        icon="pi pi-trash" 
        severity="danger"
        @click="confirmBatchDeleteInvitations()"
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
    <div v-else-if="invitations && invitations.length > 0" class="result apollo">
      <DataTable 
        v-model:selection="selectedInvitations"
        :value="invitations" 
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
        <Column field="invitation" header="Invitation" :sortable="true">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <Button
                :icon="decryptedInvitations.has(slotProps.data.id) ? 'pi pi-eye-slash' : 'pi pi-eye'"
                text
                rounded
                size="small"
                severity="secondary"
                @click="toggleInvitationVisibility(slotProps.data)"
                class="hover:bg-gray-100"
              />
              <span class="font-mono">
                {{ decryptedInvitations.has(slotProps.data.id) ? decryptedInvitations.get(slotProps.data.id) : slotProps.data.codeHash }}
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
              @click="confirmDeleteInvitation(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No result -->
    <div v-else class="p-6 text-center text-gray-500">
      <div class="text-lg">No invitations found</div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog></ConfirmDialog>
    <Dialog v-model:visible="deleteInvitationDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="invitation">Are you sure you want to delete <b>{{ getDisplayName() }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteInvitationDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deleteInvitation" severity="danger" />
      </template>
    </Dialog>

    <!-- Create Invitation Dialog -->
    <InvitationForm
      v-model:visible="createDialogVisible"
      :initialValues="initialValues"
      :submitting="invitationStore.state.submitting"
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
import { INVITATION_LIST, INVITATION_DELETE, INVITATION_DECRYPT } from '@/graphql/invitation'
import { InvitationFormat, InvitationQueryResult, InvitationState, useInvitationStore } from '@/stores/invitation'
import { apolloProvider } from '@/api/apollo'
import { formatDate } from '@/utils/date'
import InvitationForm from '@/components/invitation/Form.vue'

const props = defineProps(['uuid'])
const toast = useToast()
const confirm = useConfirm()
const invitationStore = useInvitationStore()

// Selection state
const selectedInvitations = ref<any[]>([])

// Decrypted invitations cache
const decryptedInvitations = ref<Map<number, string>>(new Map())

// Create dialog state
const createDialogVisible = ref(false)
const initialValues = ref({
  number: 1,
  length: 6,
  format: InvitationFormat.MIX
})

// Form resolver
const resolver = ref(zodResolver(
  z.object({
    number: z.number().min(1, 'Number must be at least 1'),
    length: z.number().min(4, 'Length must be at least 4').max(32, 'Length must be at most 32'),
    format: z.enum([
      InvitationFormat.INT, 
      InvitationFormat.EN, 
      InvitationFormat.MIX, 
      InvitationFormat.MIX_EXCL, 
      InvitationFormat.MIX_LOWER, 
      InvitationFormat.MIX_UPPER
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
    format: InvitationFormat.MIX
  }
}

// Handle form submission for creating new invitations
async function handleSubmit({ valid, values }: { valid: boolean; values: any }) {
  if (!valid) return
  
  try {
    await invitationStore.create(props.uuid, values)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Invitation created successfully',
      life: 3000
    })
    
    createDialogVisible.value = false
    await refetch()
  } catch (e) {
    console.error('Submit error:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Error creating invitation',
      life: 3000
    })
  }
}

// Toggle invitation status (active/inactive)
async function toggleStatus(invitation: any) {
  try {
    const newStatus = !invitation.status
    await invitationStore.updateStatus(invitation.id, props.uuid, newStatus)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Invitation ${newStatus ? 'activated' : 'deactivated'} successfully`,
      life: 3000
    })
    
    await refetch()
  } catch (e) {
    console.error('Toggle status error:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Error updating invitation status',
      life: 3000
    })
  }
}

// Toggle invitation visibility (decrypt/encrypt)
async function toggleInvitationVisibility(invitation: any) {
  try {
    // If already decrypted, hide it
    if (decryptedInvitations.value.has(invitation.id)) {
      decryptedInvitations.value.delete(invitation.id)
      return
    }
    
    // Otherwise, decrypt it
    const result = await apolloProvider.defaultClient.query({
      query: INVITATION_DECRYPT,
      variables: {
        codeHash: invitation.codeHash
      }
    })
    
    const decrypted = result.data?.decryptInvitation
    if (decrypted) {
      decryptedInvitations.value.set(invitation.id, decrypted)
    }
  } catch (e) {
    console.error('Decrypt error:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Error decrypting invitation',
      life: 3000
    })
  }
}

// Batch update status for selected invitations
async function batchUpdateStatus(status: boolean) {
  if (selectedInvitations.value.length === 0) return
  
  try {
    const ids = selectedInvitations.value.map((p: any) => p.id)
    await invitationStore.batchUpdateStatus(ids, props.uuid, status)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${selectedInvitations.value.length} invitation(s) ${status ? 'activated' : 'deactivated'} successfully`,
      life: 3000
    })
    
    selectedInvitations.value = []
    await refetch()
  } catch (e) {
    console.error('Batch update error:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Error updating invitations',
      life: 3000
    })
  }
}

const { loading, error, refetch, items: invitations, totalCount } = useEntityList<InvitationQueryResult, any>({
  query: INVITATION_LIST,
  variables: {
    input: {
      sessionId: props.uuid,
      first: 999
    },
    withPolls: false
  },
  extractEdges: (result) => result?.invitations?.[0]?.edges,
  getTotalCount: (result) => result?.invitations?.[0]?.totalCount ?? 0
})

const confirmBatchDeleteInvitations = () => {
  if (selectedInvitations.value.length === 0) return
  confirm.require({
    message: 'Are you sure you want to delete the selected invitations?',
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
      const ids = selectedInvitations.value.map((p: any) => p.id)
      await invitationStore.batchDeleteInvitations(ids)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${selectedInvitations.value.length} invitation(s) deleted successfully`,
        life: 3000
      })
      
      selectedInvitations.value = []
      await refetch()
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    }
  });
}

const {
  deleteDialog: deleteInvitationDialog,
  entity: invitation,
  confirmDelete: confirmDeleteInvitation,
  executeDelete: deleteInvitation,
  getDisplayName
} = useEntityDelete<InvitationState['initialValues']>({
  mutation: INVITATION_DELETE,
  entityName: 'Invitation',
  getDisplayName: (invitation) => invitation.codeHash ?? 'this invitation',
  getDeleteVariables: (invitation) => ({ ids: [invitation.id] }),
  onSuccess: async () => { await refetch() }
})
</script>