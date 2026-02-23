<template>
  <div class="card">
    <Message v-if="state.error" severity="error" :closable="false">
      {{ state.isEdit ? 'Read/Submit Failed: ' : 'Submit Failed: ' }} {{ state.error?.message }}
    </Message>

    <FormSkeleton v-if="state.loadingInitial" class="p-mb-3" />
    <Form
      v-if="!state.loadingInitial"
      :key="state.uuid || 'create'"
      :initialValues="state.initialValues"
      :resolver="resolver"
      :submitting="state.submitting"
      :submitText="state.isEdit ? 'Update' : 'Create'"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { storeToRefs } from 'pinia';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';
import { useRoute } from 'vue-router';
import { z } from 'zod';

import Form from '@/components/vote/Form.vue';
import FormSkeleton from '@/components/widget/FormSkeleton.vue';
import { useVoteStore, VoteState } from '@/stores/vote';
import { zodResolver } from '@primevue/forms/resolvers/zod';

const route = useRoute()
const store = useVoteStore()
const toast = useToast();

const props = defineProps(['uuid']);

onMounted(() => {
  store.init(props.uuid)
})

// Listen to route changes to re-initialize the store (e.g., when navigating from edit to create)
watch(() => route.fullPath, () => {
  store.init(props.uuid)
})

onBeforeUnmount(() => {
  store.reset()
})

const { state } = storeToRefs(store)

const resolver = ref(zodResolver(
  z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().optional(),
    startTime: z.date('Start Time is required.'),
    endTime: z.date('End Time is required.')
  })
));

async function handleSubmit({ valid, values }: { valid: boolean; values: VoteState['initialValues'] }) {
  try {
    console.log('Form submission:', { valid, values });
    console.log('Store initialValues:', state.value.initialValues);
    console.log('Is edit mode:', state.value.isEdit);
    
    if (!valid) {
      console.log('Form validation failed');
      return;
    }
    
    await store.submit(values)
    // Show success toast after successful submission
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: state.value.isEdit ? 'Vote updated successfully' : 'Vote created successfully', 
      life: 3000
    });
  } catch (e) {
    // Error is already in state.error, optionally add toast
    console.error('Submit error:', e)
    const errorMessage = e instanceof Error ? e.message : 'Error updating vote';
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: errorMessage, 
      life: 3000
    });
  }
}
</script>