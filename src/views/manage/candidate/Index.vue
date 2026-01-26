<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Candidates</h1>
    <Button 
      label="Create New Candidate" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="$router.push(`/manage/candidate/${uuid}/create`)"
    />
    
    <ApolloQuery
      :query="_candidateQuery"
      :variables="{ 
        query: {
          voteId: uuid,
          first: 999
        } 
      }"
    >
      <template v-slot="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-lg text-gray-600">Loading...</div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="text-red-800">An error occurred</div>
        </div>

        <!-- Result -->
        <div v-else-if="data && data.candidates && data.candidates[0] && data.candidates[0].edges.length > 0" class="result apollo">
          <DataTable 
            :value="data.candidates[0].edges.map(edge => edge.node)" 
            striped-rows
            scrollable
            scroll-height="flex"
            responsive-layout="scroll"
            paginator
            :rows="5"
            :total-records="data.candidates[0].totalCount"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rows-per-page-options="[5, 10, 20, 50]"
          >
            <Column field="id" header="ID" :sortable="true"></Column>
            <Column field="name" header="Name" :sortable="true">
              <template #body="slotProps">
                <RouterLink 
                  :to="`/manage/candidate/${uuid}/update/${slotProps.data.id}`" 
                  class="text-amber-700 hover:underline"
                >
                  {{ slotProps.data.name }}
                </RouterLink>
              </template>
            </Column>
            <Column field="questionId" header="Question" :sortable="true">
              <template #body="slotProps">
                {{ questionStore.questionMap.get(slotProps.data.questionId) || 'N/A' }}
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
                  @click="confirmDeleteCandidate(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- No result -->
        <div v-else class="p-6 text-center text-gray-500">
          <div class="text-lg">No candidates found</div>
        </div>
      </template>
    </ApolloQuery>
    <Dialog v-model:visible="deleteCandidateDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="candidate">Are you sure you want to delete <b>{{ candidate.title }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteCandidateDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deleteCandidate" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ApolloQuery } from '@vue/apollo-components'
import { CANDIDATE_LIST, CANDIDATE_DELETE } from '@/api/candidate.js'
import { useCandidateStore } from '@/stores/candidate';
import { useQuestionStore } from '@/stores/question';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';

export default {
  components: {
    ApolloQuery,
    DataTable,
    Column,
    Button,
    Dialog,
    Tag
  },
  props: {
    uuid: {
      type: String,
      required: true
    }
  },
  setup() {
    const candidateStore = useCandidateStore();
    const questionStore = useQuestionStore();
    return {
      candidateStore,
      questionStore,
    };
  },
  data() {
    return {
      _candidateQuery: CANDIDATE_LIST,
      deleteCandidateDialog: false,
      candidate: null,
      questions: []
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString()
    },
    confirmDeleteCandidate(candidate) {
      this.candidate = candidate;
      this.deleteCandidateDialog = true;
    },
    async deleteCandidate() {
      try {
        const result = await this.$apollo.mutate({
          mutation: CANDIDATE_DELETE,
          variables: {
            ids: [this.candidate.id]
          },
          update: (store, { data: { deleteCandidate: _deleteCandidate } }) => {
            // 更新本地緩存以反映刪除操作
            const cachedData = store.readQuery({
              query: CANDIDATE_LIST,
              variables: {
                query: {
                  voteId: this.uuid,
                  first: 999
                },
              }
            });
            
            // Create a deep copy to avoid mutating read-only cache
            const data = {
              candidates: [{
                ...cachedData.candidates[0],
                edges: cachedData.candidates[0].edges.filter(
                  edge => edge.node.id !== this.candidate.id
                ),
                totalCount: cachedData.candidates[0].totalCount - 1
              }]
            };

            store.writeQuery({
              query: CANDIDATE_LIST,
              data,
              variables: {
                query: {
                  voteId: this.uuid,
                  first: 999
                },
              }
            });
          }
        });
        console.log(result);
        console.log('Deleting candidate:', this.candidate);
        this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Candidate deleted successfully.', life: 3000 });
      } catch (error) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete candidate.', life: 3000 });
        console.error('Error deleting candidate:', error);
      } finally {
        this.deleteCandidateDialog = false;
        this.candidate = null;
      }
    }
  }
}

</script>