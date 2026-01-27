<template>
  <div class="card">
    <Message v-if="store.state.error" severity="error" :closable="false">
      {{ isEdit ? 'Read/Submit Failed: ' : 'Submit Failed: ' }} {{ error.message }}
    </Message>

    <div v-if="store.state.loadingInitial" class="p-mb-3">Loading...</div>
    <Form
      v-if="!store.state.loadingInitial"
      :key="store.state.uuid || 'create'"
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
import { useRoute, useRouter } from 'vue-router'
import Message from 'primevue/message'
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Form from '@/components/vote/Form.vue'
import { useToast } from 'primevue/usetoast';
import { useVoteStore } from '@/stores/vote'
import { z } from 'zod';

const route = useRoute()
const router = useRouter()
const store = useVoteStore()
const toast = useToast();

// 取得路由 uuid，決定新增/編輯
function currentUuid() {
  return route.params.uuid ? String(route.params.uuid) : null
}

onMounted(() => {
  store.init(currentUuid())
})

// 若路由變更（例如由新增 -> 編輯），重新 init
watch(() => route.fullPath, () => {
  store.init(currentUuid())
})

onBeforeUnmount(() => {
  store.reset()
})

const resolver = ref(zodResolver(
  z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().optional(),
    startTime: z.date('Start Time is required.'),
    endTime: z.date('End Time is required.')
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
    // 成功後導頁或提示
    // router.push({ name: 'VoteIndex' })
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Vote updated successfully', 
      life: 3000
    });
  } catch (e) {
    // 錯誤已在 store.error，可視需要加 toast
    console.error('Submit error:', e)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: e.message || 'Error updating vote', 
      life: 3000
    });
  }
}

console.log('Component loaded - store state:', { 
  isEdit: store.state.isEdit, 
  initialValues: store.state.initialValues, 
  loadingInitial: store.state.loadingInitial 
});

</script>