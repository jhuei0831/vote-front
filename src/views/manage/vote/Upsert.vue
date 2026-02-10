<template>
  <div class="card">
    <Message v-if="state.error" severity="error" :closable="false">
      {{ state.isEdit ? 'Read/Submit Failed: ' : 'Submit Failed: ' }} {{ state.error.message }}
    </Message>

    <div v-if="state.loadingInitial" class="p-mb-3">Loading...</div>
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

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';
import { useVoteStore } from '@/stores/vote'
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Form from '@/components/vote/Form.vue'
import Message from 'primevue/message'

const route = useRoute()
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

const { state } = storeToRefs(store)

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
      detail: 'Vote updated successfully', 
      life: 3000
    });
  } catch (e) {
    // 錯誤已在 state.error，可視需要加 toast
    console.error('Submit error:', e)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: e.message || 'Error updating vote', 
      life: 3000
    });
  }
}
</script>