<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Questions</h1>
    <Button 
      label="Create New Question" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="$router.push(`/manage/question/${uuid}/upsert`)"
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
    <div v-else-if="questions && questions.length > 0" class="result apollo">
      <DataTable 
        :value="questions" 
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
              :to="`/manage/question/${uuid}/upsert/${slotProps.data.id}`" 
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
              @click="confirmDeleteQuestion(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No result -->
    <div v-else class="p-6 text-center text-gray-500">
      <div class="text-lg">No questions found</div>
    </div>
    

    <Dialog v-model:visible="deleteQuestionDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="question">Are you sure you want to delete <b>{{ getDisplayName() }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteQuestionDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deleteQuestion" severity="danger" />
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
import { QUESTION_LIST, QUESTION_DELETE } from '@/graphql/question'
import { QuestionState, QuestionQueryResult } from '@/stores/question'
import { formatDate } from '@/utils/date'

const props = defineProps(['uuid'])

const { loading, error, refetch, items: questions, totalCount } = useEntityList<QuestionQueryResult, any>({
  query: QUESTION_LIST,
  variables: {
    questionQuery: {
      voteId: props.uuid,
      first: 999
    },
    withCandidates: false
  },
  extractEdges: (result) => result?.questions?.[0]?.edges,
  getTotalCount: (result) => result?.questions?.[0]?.totalCount ?? 0
})

const {
  deleteDialog: deleteQuestionDialog,
  entity: question,
  confirmDelete: confirmDeleteQuestion,
  executeDelete: deleteQuestion,
  getDisplayName
} = useEntityDelete<QuestionState['initialValues']>({
  mutation: QUESTION_DELETE,
  entityName: 'Question',
  getDisplayName: (question) => question.title ?? 'this question',
  getDeleteVariables: (question) => ({ ids: [question.id] }),
  onSuccess: async () => { await refetch() }
})
</script>