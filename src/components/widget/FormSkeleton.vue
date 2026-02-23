<template>
  <div class="form-skeleton">
    <div v-for="i in rows" :key="i" class="field mb-4">
      <Skeleton width="8rem" height="1.5rem" class="mb-2"></Skeleton>
      <Skeleton height="3rem" class="w-full"></Skeleton>
    </div>
    
    <div v-if="withTextarea" class="field mb-4">
      <Skeleton width="8rem" height="1.5rem" class="mb-2"></Skeleton>
      <Skeleton height="8rem" class="w-full"></Skeleton>
    </div>

    <div v-if="withButtons" class="flex gap-2 mt-6 justify-center">
      <Skeleton width="6rem" height="2.5rem"></Skeleton>
      <Skeleton width="6rem" height="2.5rem"></Skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';

interface Props {
  rows?: number;
  withTextarea?: boolean;
  withButtons?: boolean;
}

withDefaults(defineProps<Props>(), {
  rows: 3,
  withTextarea: false,
  withButtons: true
});
</script>