<template>
  <div class="card">
    <DataTable :value="rows" :headers="headers">
      <div v-for="header in headers">
        <Column :field="header.toLowerCase()" :header="header">
          <template #body>
            <Skeleton></Skeleton>
          </template>
        </Column>
      </div>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Skeleton from 'primevue/skeleton';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

interface Props {
  headers: string[];
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5
});

const rows = computed(() => new Array(props.rows));
</script>
