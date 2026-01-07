<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Votes</h1>
    <Button 
      label="Create New Vote" 
      icon="pi pi-plus" 
      class="mb-4" 
      @click="visible = true"
    />
    <FormDialog v-model:visible="visible" />
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
            <Column field="id" header="ID" :sortable="true" style="width: 10%"></Column>
            <Column field="title" header="Title" :sortable="true" style="width: 20%"></Column>
            <Column field="description" header="Description" style="width: 25%"></Column>
            <Column field="status" header="Status" :sortable="true" style="width: 10%">
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
            <Column field="startTime" header="Start Time" :sortable="true" style="width: 15%">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.startTime) }}
              </template>
            </Column>
            <Column field="endTime" header="End Time" :sortable="true" style="width: 15%">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.endTime) }}
              </template>
            </Column>
            <Column field="creator.account" header="Creator" style="width: 10%"></Column>
          </DataTable>
        </div>

        <!-- No result -->
        <div v-else class="p-6 text-center text-gray-500">
          <div class="text-lg">No votes found</div>
        </div>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import { ApolloQuery } from '@vue/apollo-components'
import { VOTE_VIEW } from '@/api/vote.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button';
import FormDialog from '@/components/vote/FormDialog.vue';

export default {
  components: {
    ApolloQuery,
    DataTable,
    Column,
    Button,
    FormDialog
  },
  data() {
    return {
      _voteQuery: VOTE_VIEW,
      visible: false
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString()
    }
  },
  apollo: {
    votes: {
      query: VOTE_VIEW,
      variables() {
        return {
          vote: {
            first: 999
          },
          withQuestions: false  
        }
      },
      update ({ allVotes }) {
				// The field is different from 'votes'
				return allVotes
			},
    },
  }
}

</script>