<template>
  <div class="card">
    <Message v-if="state.error" severity="error" :closable="false">
      {{ state.isEdit ? 'Read/Submit Failed: ' : 'Submit Failed: ' }} {{ state.error.message }}
    </Message>

    <div v-if="state.loadingInitial" class="p-mb-3">Loading...</div>
    <Form
      v-if="!state.loadingInitial"
      :key="state.uuid || 'create'"
      :uuid="state.uuid ?? 'null'"
      :initialValues="state.initialValues"
      :resolver="resolver"
      :submitting="state.submitting"
      :submitText="state.isEdit ? 'Update' : 'Create'"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';
import { useCandidateStore, CandidateState } from '@/stores/candidate'
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Form from '@/components/candidate/Form.vue'
import Message from 'primevue/message'

const route = useRoute()
const store = useCandidateStore()
const toast = useToast();

const props = defineProps(['uuid', 'id']);

onMounted(() => {
  store.init(props.uuid, props.id)
})

// Listen to route changes to re-initialize the store (e.g., when navigating from edit to create)
watch(() => route.fullPath, () => {
  store.init(props.uuid, props.id)
})

onBeforeUnmount(() => {
  store.reset()
})

const { state } = storeToRefs(store)

const resolver = ref(zodResolver(
  z.object({
    questionId: z.number({ error: 'Question is required.' }),
    name: z.string().min(1, 'Name is required.'),
  })
));

async function handleSubmit({ valid, values }: { valid: boolean; values: CandidateState['initialValues'] }) {
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
      detail: state.value.isEdit ? 'Candidate updated successfully' : 'Candidate created successfully', 
      life: 3000
    });
  } catch (e) {
    // Errors are already in state.error, but you can add a toast if needed
    console.error('Submit error:', e)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: state.value.isEdit ? 'Error updating candidate' : 'Error creating candidate', 
      life: 3000
    });
  }
}
</script>