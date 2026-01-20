<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Questions</h1>
    <Button 
      label="Create New Question" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="$router.push('/manage/question/create')"
    />
    
    <ApolloQuery
      :query="_questionQuery"
      :variables="{ 
        questionQuery: {
          voteId: voteUuid,
          first: 999
        },
        withCandidates: false  
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
        <div v-else-if="data && data.questions && data.questions[0] && data.questions[0].edges.length > 0" class="result apollo">
          <DataTable 
            :value="data.questions[0].edges.map(edge => edge.node)" 
            striped-rows
            scrollable
            scroll-height="flex"
            responsive-layout="scroll"
            paginator
            :rows="5"
            :total-records="data.questions[0].totalCount"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rows-per-page-options="[5, 10, 20, 50]"
          >
            <Column field="id" header="ID" :sortable="true"></Column>
            <Column field="title" header="Title" :sortable="true">
              <template #body="slotProps">
                <RouterLink 
                  :to="`/manage/question/update/${slotProps.data.uuid}`" 
                  @click="questionStore.setCurrentQuestion(slotProps.data)"
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
      </template>
    </ApolloQuery>
    <Dialog v-model:visible="deleteQuestionDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="question">Are you sure you want to delete <b>{{ question.title }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteQuestionDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deleteQuestion" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ApolloQuery } from '@vue/apollo-components'
import { QUESTION_LIST, QUESTION_DELETE } from '@/api/question.js'
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
    const questionStore = useQuestionStore();
    return {
      questionStore,
    };
  },
  data() {
    return {
      _questionQuery: QUESTION_LIST,
      deleteQuestionDialog: false,
      question: null
    }
  },
  computed: {
    voteUuid() {
      return this.$route.params.uuid;
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString()
    },
    confirmDeleteQuestion(question) {
      this.question = question;
      this.deleteQuestionDialog = true;
    },
    async deleteQuestion() {
      try {
        const result = await this.$apollo.mutate({
          mutation: QUESTION_DELETE,
          variables: {
            ids: [this.question.id]
          },
          update: (store, { data: { deleteQuestion: _deleteQuestion } }) => {
            // 更新本地緩存以反映刪除操作
            const cachedData = store.readQuery({
              query: QUESTION_LIST,
              variables: {
                questionQuery: {
                  voteId: this.voteUuid,
                  first: 999
                },
                withCandidates: false  
              }
            });
            console.log(this.voteUuid);
            console.log(cachedData);
            
            // Create a deep copy to avoid mutating read-only cache
            const data = {
              questions: [{
                ...cachedData.questions[0],
                edges: cachedData.questions[0].edges.filter(
                  edge => edge.node.id !== this.question.id
                ),
                totalCount: cachedData.questions[0].totalCount - 1
              }]
            };

            store.writeQuery({
              query: QUESTION_LIST,
              data,
              variables: {
                questionQuery: {
                  voteId: this.voteUuid,
                  first: 999
                },
                withCandidates: false  
              }
            });
          }
        });
        console.log(result);
        console.log('Deleting question:', this.question);
        this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Question deleted successfully.', life: 3000 });
      } catch (error) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete question.', life: 3000 });
        console.error('Error deleting question:', error);
      } finally {
        this.deleteQuestionDialog = false;
        this.question = null;
      }
    }
  }
}

</script>