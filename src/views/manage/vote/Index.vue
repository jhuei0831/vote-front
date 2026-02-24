<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Votes</h1>
    <Button 
      label="Create New Vote" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="$router.push('/manage/vote/upsert')"
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
    <div v-else-if="votes && votes.length > 0" class="result apollo">
      <DataTable 
        :value="votes" 
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
              :to="`/manage/vote/upsert/${slotProps.data.uuid}`" 
              @click="voteStore.setCurrentVote(slotProps.data)"
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
              @click="confirmDeleteVote(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No result -->
    <div v-else class="p-6 text-center text-gray-500">
      <div class="text-lg">No votes found</div>
    </div>
    <Dialog v-model:visible="deleteVoteDialog" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="vote">Are you sure you want to delete <b>{{ getDisplayName() }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteVoteDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deleteVote" severity="danger" />
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
import { VOTE_DELETE, VOTE_LIST } from '@/graphql/vote'
import { useVoteStore, VoteQueryResult, VoteState } from '@/stores/vote'
import { formatDate } from '@/utils/date'

const voteStore = useVoteStore()
voteStore.clearVote()

const { loading, error, refetch, items: votes, totalCount } = useEntityList<VoteQueryResult, any>({
  query: VOTE_LIST,
  variables: {
    vote: { first: 999 },
    withQuestions: false
  },
  extractEdges: (result) => result?.votes?.[0]?.edges,
  getTotalCount: (result) => result?.votes?.[0]?.totalCount ?? 0
})

const {
  deleteDialog: deleteVoteDialog,
  entity: vote,
  confirmDelete: confirmDeleteVote,
  executeDelete: deleteVote,
  getDisplayName
} = useEntityDelete<VoteState['initialValues']>({
  mutation: VOTE_DELETE,
  entityName: 'Vote',
  getDisplayName: (vote) => vote.title ?? 'this vote',
  getDeleteVariables: (vote) => ({ uuid: [vote.uuid] }),
  onSuccess: async () => { await refetch() }
})

function getSeverity(vote: VoteState['initialValues']) {
  switch (vote.status) {
    case 0:
      return 'danger'
    case 1:
      return 'success'
    default:
      return undefined
  }
}
</script>