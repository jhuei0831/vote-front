<template>
  <div class="card">
    <Message v-if="state.error" severity="error" :closable="false">
      {{ state.isEdit ? 'Read/Submit Failed: ' : 'Submit Failed: ' }} {{ state.error?.message }}
    </Message>

    <div v-if="state.loadingInitial" class="p-mb-3">Loading...</div>
    <Form
      v-if="!state.loadingInitial"
      :key="state.uuid || 'create'"
      :uuid="state.uuid"
      :initialValues="state.initialValues"
      :resolver="resolver"
      :submitting="state.submitting"
      :submitText="state.isEdit ? 'Update' : 'Create'"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';
import { useQuestionStore } from '@/stores/question'
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Form from '@/components/question/Form.vue'
import Message from 'primevue/message'

const route = useRoute()
const store = useQuestionStore()
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
    title: z.string().min(1, 'Title is required.'),
    description: z.string().optional()
  })
));

async function handleSubmit({ valid, values }) {
  try {
    console.log('Form submission:', { valid, values });
    console.log('Store initialValues:', state.initialValues);
    console.log('Is edit mode:', state.isEdit);
    
    if (!valid) {
      console.log('Form validation failed');
      return;
    }
    
    await store.submit(values)
    // 成功後提示
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Question updated successfully', 
      life: 3000
    });
  } catch (e) {
    // 錯誤已在 state.error，可視需要加 toast
    console.error('Submit error:', e)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: e.message || 'Error updating question', 
      life: 3000
    });
  }
}
</script>