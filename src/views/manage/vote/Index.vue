<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Votes</h1>
    <Button 
      label="Create New Vote" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="$router.push('/manage/vote/create')"
    />
    
    <ApolloQuery
      :query="_voteQuery"
      :variables="{ 
        vote: {
          first: 999
        },
        withQuestions: false  
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
        <div v-else-if="data && data.votes && data.votes[0] && data.votes[0].edges.length > 0" class="result apollo">
          <DataTable 
            :value="data.votes[0].edges.map(edge => edge.node)" 
            striped-rows
            scrollable
            scroll-height="flex"
            responsive-layout="scroll"
            paginator
            :rows="5"
            :total-records="data.votes[0].totalCount"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rows-per-page-options="[5, 10, 20, 50]"
          >
            <Column field="id" header="ID" :sortable="true"></Column>
            <Column field="title" header="Title" :sortable="true">
              <template #body="slotProps">
                <RouterLink :to="`/manage/vote/update/${slotProps.data.uuid}`" class="text-indigo-600 hover:underline">
                  {{ slotProps.data.title }}
                </RouterLink>
              </template>
            </Column>
            <Column field="status" header="Status" :sortable="true">
              <template #body="slotProps">
                <span 
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    slotProps.data.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ slotProps.data.status }}
                </span>
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
      </template>
    </ApolloQuery>
    <Dialog v-model:visible="deleteVoteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="vote">Are you sure you want to delete <b>{{ vote.title }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteVoteDialog = false" severity="secondary"
          variant="text" />
        <Button label="Yes" icon="pi pi-check" @click="deleteVote" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ApolloQuery } from '@vue/apollo-components'
import { VOTE_LIST, VOTE_DELETE } from '@/api/vote.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

export default {
  components: {
    ApolloQuery,
    DataTable,
    Column,
    Button,
    Dialog
  },
  data() {
    return {
      _voteQuery: VOTE_LIST,
      deleteVoteDialog: false,
      vote: null
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString()
    },
    confirmDeleteVote(vote) {
      this.vote = vote;
      this.deleteVoteDialog = true;
    },
    async deleteVote() {
      try {
        const result = await this.$apollo.mutate({
          mutation: VOTE_DELETE,
          variables: {
            uuid: [this.vote.uuid]
          },
          update: (store, { data: { deleteVote: _deleteVote } }) => {
            // 更新本地緩存以反映刪除操作
            const cachedData = store.readQuery({
              query: VOTE_LIST,
              variables: {
                vote: {
                  first: 999
                },
                withQuestions: false  
              }
            });

            // Create a deep copy to avoid mutating read-only cache
            const data = {
              votes: [{
                ...cachedData.votes[0],
                edges: cachedData.votes[0].edges.filter(
                  edge => edge.node.uuid !== this.vote.uuid
                ),
                totalCount: cachedData.votes[0].totalCount - 1
              }]
            };

            store.writeQuery({
              query: VOTE_LIST,
              data,
              variables: {
                vote: {
                  first: 999
                },
                withQuestions: false  
              }
            });
          }
        });
        console.log(result);
        console.log('Deleting vote:', this.vote);
        this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Vote deleted successfully.', life: 3000 });
      } catch (error) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete vote.', life: 3000 });
        console.error('Error deleting vote:', error);
      } finally {
        this.deleteVoteDialog = false;
        this.vote = null;
      }
    }
  }
}

</script>