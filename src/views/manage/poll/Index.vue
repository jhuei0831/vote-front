<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Polls</h1>
    <Button 
      label="Create New Poll" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="$router.push(`/manage/poll/${uuid}/upsert`)"
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
    <div v-else-if="polls && polls.length > 0" class="result apollo">
      <DataTable 
        :value="polls" 
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
              :to="`/manage/poll/${uuid}/upsert/${slotProps.data.id}`" 
              class="text-amber-700 hover:underline"
            >
              {{ slotProps.data.title }}
            </RouterLink>
          </template>
        </Column>
        <Column field="description" header="Description" :sortable="false" />
        <Column field="createdAt" header="Created At" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column field="updatedAt" header="Updated At" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.updatedAt) }}
          </template>
        </Column>
        <Column :exportable="false">
          <template #body="slotProps">
            <Button icon="pi pi-trash" variant="outlined" rounded severity="danger"
              @click="confirmDeletePoll(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No result -->
    <div v-else class="p-6 text-center text-gray-500">
      <div class="text-lg">No polls found</div>
    </div>
    

    <Dialog v-model:visible="deletePollDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="poll">Are you sure you want to delete <b>{{ getDisplayName() }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deletePollDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deletePoll" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'

import TableSkeleton from '@/components/widget/TableSkeleton.vue'
import { useEntityList } from '@/composables/useEntityList'
import { useEntityDelete } from '@/composables/useEntityDelete'
import { POLL_LIST, POLL_DELETE } from '@/graphql/poll'
import { PollState, PollQueryResult } from '@/stores/poll'
import { formatDate } from '@/utils/date'

const props = defineProps(['uuid'])

const { loading, error, refetch, items: polls, totalCount } = useEntityList<PollQueryResult, any>({
  query: POLL_LIST,
  variables: {
    input: {
      sessionId: props.uuid,
      first: 999
    },
    withPollOptions: false
  },
  extractEdges: (result) => result?.polls?.[0]?.edges,
  getTotalCount: (result) => result?.polls?.[0]?.totalCount ?? 0
})

const {
  deleteDialog: deletePollDialog,
  entity: poll,
  confirmDelete: confirmDeletePoll,
  executeDelete: deletePoll,
  getDisplayName
} = useEntityDelete<PollState['initialValues']>({
  mutation: POLL_DELETE,
  entityName: 'Poll',
  getDisplayName: (poll) => poll.title ?? 'this poll',
  getDeleteVariables: (poll) => ({ ids: [poll.id] }),
  onSuccess: async () => { await refetch() }
})
</script>