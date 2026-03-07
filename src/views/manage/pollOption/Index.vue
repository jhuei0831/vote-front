<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">PollOptions</h1>
    <Button 
      label="Create New PollOption" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="$router.push(`/manage/poll-option/${uuid}/upsert`)"
    />
    
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-lg text-gray-600">Loading...</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="text-red-800">An error occurred</div>
    </div>

    <!-- Result -->
    <div v-else-if="pollOptions && pollOptions.length > 0" class="result apollo">
      <DataTable 
        :value="pollOptions" 
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
        <Column field="name" header="Name" :sortable="true">
          <template #body="slotProps">
            <RouterLink 
              :to="`/manage/poll-option/${uuid}/upsert/${slotProps.data.id}`" 
              class="text-amber-700 hover:underline"
            >
              {{ slotProps.data.name }}
            </RouterLink>
          </template>
        </Column>
        <Column field="pollId" header="Poll" :sortable="true">
          <template #body="slotProps">
            {{ pollStore.pollMap.get(slotProps.data.pollId) || 'N/A' }}
          </template>
        </Column>
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
              @click="confirmDeletePollOption(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No result -->
    <div v-else class="p-6 text-center text-gray-500">
      <div class="text-lg">No poll options found</div>
    </div>
    <Dialog v-model:visible="deletePollOptionDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="pollOption">Are you sure you want to delete <b>{{ getDisplayName() }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deletePollOptionDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deletePollOption" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'

import { useEntityList } from '@/composables/useEntityList'
import { useEntityDelete } from '@/composables/useEntityDelete'
import { POLL_OPTION_LIST, POLL_OPTION_DELETE } from '@/graphql/pollOption'
import { PollOptionQueryResult, PollOptionState } from '@/stores/pollOption'
import { usePollStore } from '@/stores/poll'
import { formatDate } from '@/utils/date'

const props = defineProps(['uuid'])
const pollStore = usePollStore()

const { loading, error, refetch, items: pollOptions, totalCount } = useEntityList<PollOptionQueryResult, any>({
  query: POLL_OPTION_LIST,
  variables: {
    input: {
      sessionId: props.uuid,
      first: 999
    },
    withPolls: false
  },
  extractEdges: (result) => result?.pollOptions?.[0]?.edges,
  getTotalCount: (result) => result?.pollOptions?.[0]?.totalCount ?? 0
})

const {
  deleteDialog: deletePollOptionDialog,
  entity: pollOption,
  confirmDelete: confirmDeletePollOption,
  executeDelete: deletePollOption,
  getDisplayName
} = useEntityDelete<PollOptionState['initialValues']>({
  mutation: POLL_OPTION_DELETE,
  entityName: 'PollOption',
  getDisplayName: (pollOption) => pollOption.name ?? 'this pollOption',
  getDeleteVariables: (pollOption) => ({ ids: [pollOption.id] }),
  onSuccess: async () => { await refetch() }
})
</script>