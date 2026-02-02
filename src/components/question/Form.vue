<template>
  <Form v-slot="$form" :initialValues :resolver @submit="onSubmit" class="flex flex-col gap-4 w-full">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Enter question information.</span>
    <div class="mb-4">
      <div class="flex items-center gap-4 mb-1">
        <label for="title" class="font-semibold w-24">Title</label>
        <InputText id="title" name="title" class="flex-auto" autocomplete="off" fluid />
      </div>
      <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple" class="ml-28">
        {{ $form.title.error?.message }}
      </Message>
    </div>

    <div class="flex items-center gap-4 mb-1">
      <label for="description" class="font-semibold w-24">Description</label>
      <Editor name="description" class="flex-auto" rows="4" />
    </div>

    <div class="text-center">
      <RouterLink :to="`/manage/question/${uuid}`" class="mr-4 text-gray-500 hover:underline">Back</RouterLink>
      <Button type="submit" :loading="submitting" :label="submitText" severity="Success" icon="pi pi-save" />
    </div>
  </Form>
</template>

<script setup>
import { Form } from '@primevue/forms';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import Message from 'primevue/message'
import { computed } from 'vue'

const props = defineProps({
  uuid: { type: String, required: true },
  initialValues: { type: Object, required: true },
  submitting: { type: Boolean, default: false },
  submitText: { type: String, default: 'Save' },
  resolver: { type: Function, required: true }
})

const emit = defineEmits(['submit']);

const submitText = computed(() => props.submitText);
const uuid = computed(() => props.uuid);

function onSubmit({ valid, values }) {
  emit('submit', { valid, values })
}
</script>