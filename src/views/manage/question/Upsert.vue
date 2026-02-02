<template>
  <div class="card">
    <Message v-if="store.state.error" severity="error" :closable="false">
      {{ store.state.isEdit ? 'Read/Submit Failed: ' : 'Submit Failed: ' }} {{ store.state.error.message }}
    </Message>

    <div v-if="store.state.loadingInitial" class="p-mb-3">Loading...</div>
    <Form
      v-if="!store.state.loadingInitial"
      :key="store.state.uuid || 'create'"
      :uuid="store.state.uuid"
      :initialValues="store.state.initialValues"
      :resolver="resolver"
      :submitting="store.state.submitting"
      :submitText="store.state.isEdit ? 'Update' : 'Create'"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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

// 若路由變更（例如由新增 -> 編輯），重新 init
watch(() => route.fullPath, () => {
  store.init(props.uuid, props.id)
})

onBeforeUnmount(() => {
  store.reset()
})

const resolver = ref(zodResolver(
  z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().optional()
  })
));

async function handleSubmit({ valid, values }) {
  try {
    console.log('Form submission:', { valid, values });
    console.log('Store initialValues:', store.state.initialValues);
    console.log('Is edit mode:', store.state.isEdit);
    
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
    // 錯誤已在 store.error，可視需要加 toast
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