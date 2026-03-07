<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Sessions</h1>
    <Button 
      label="Create New Session" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="$router.push('/manage/session/upsert')"
    />
    
    <!-- Loading -->
    <div v-if="loading">
      <TableSkeleton :headers="['ID', 'Title', 'Status', 'Start Time', 'End Time', 'Creator']" :rows="10" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="text-red-800">An error occurred: {{ error.message }}</div>
    </div>

    <!-- Result -->
    <div v-else-if="sessions && sessions.length > 0" class="result apollo">
      <DataTable 
        :value="sessions" 
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
        <Column field="id" header="ID" :sortable="true"></Column>
        <Column field="title" header="Title" :sortable="true">
          <template #body="slotProps">
            <RouterLink 
              :to="`/manage/session/upsert/${slotProps.data.uuid}`" 
              @click="sessionStore.setCurrentSession(slotProps.data)"
              class="text-amber-700 hover:underline"
            >
              {{ slotProps.data.title }}
            </RouterLink>
          </template>
        </Column>
        <Column field="status" header="Status" :sortable="true">
          <template #body="slotProps">
            <Tag :value="slotProps.data.status ? 'Active' : 'Inactive'" :severity="getSeverity(slotProps.data)" />
          </template>
          
        </Column>
        <Column field="startTime" header="Start Time" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.startTime) }}
          </template>
        </Column>
        <Column field="endTime" header="End Time" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.endTime) }}
          </template>
        </Column>
        <Column field="creator.account" header="Creator"></Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-trash" variant="outlined" rounded severity="danger"
              @click="confirmDeleteSession(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No result -->
    <div v-else class="p-6 text-center text-gray-500">
      <div class="text-lg">No sessions found</div>
    </div>
    <Dialog v-model:visible="deleteSessionDialog" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="session">Are you sure you want to delete <b>{{ getDisplayName() }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteSessionDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deleteSession" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'

import TableSkeleton from '@/components/widget/TableSkeleton.vue'
import { useEntityList } from '@/composables/useEntityList'
import { useEntityDelete } from '@/composables/useEntityDelete'
import { SESSION_DELETE, SESSION_LIST } from '@/graphql/session'
import { useSessionStore, SessionQueryResult, SessionState } from '@/stores/session'
import { formatDate } from '@/utils/date'

const sessionStore = useSessionStore()
sessionStore.clearSession()

const { loading, error, refetch, items: sessions, totalCount } = useEntityList<SessionQueryResult, any>({
  query: SESSION_LIST,
  variables: {
    input: { first: 999 },
    withPolls: false
  },
  extractEdges: (result) => result?.sessions?.[0]?.edges,
  getTotalCount: (result) => result?.sessions?.[0]?.totalCount ?? 0
})

const {
  deleteDialog: deleteSessionDialog,
  entity: session,
  confirmDelete: confirmDeleteSession,
  executeDelete: deleteSession,
  getDisplayName
} = useEntityDelete<SessionState['initialValues']>({
  mutation: SESSION_DELETE,
  entityName: 'Session',
  getDisplayName: (session) => session.title ?? 'this session',
  getDeleteVariables: (session) => ({ uuid: [session.uuid] }),
  onSuccess: async () => { await refetch() }
})

function getSeverity(session: SessionState['initialValues']) {
  switch (session.status) {
    case 0:
      return 'danger'
    case 1:
      return 'success'
    default:
      return undefined
  }
}
</script>