<template>
  <Form v-slot="$form" :initialValues :resolver @submit="onSubmit" class="flex flex-col gap-4 w-full">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Enter vote information.</span>
    <div class="mb-4">
      <div class="flex items-center gap-4 mb-1">
        <label for="title" class="font-semibold w-24">Title</label>
        <InputText name="title" class="flex-auto" autocomplete="off" />
      </div>
      <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple" class="ml-28">
        {{ $form.title.error?.message }}
      </Message>
    </div>

    <div class="flex items-center gap-4 mb-1">
      <label for="description" class="font-semibold w-24">Description</label>
      <Editor name="description" class="flex-auto" rows="4" />
    </div>
    
    <div class="mb-4">
      <div class="flex items-center gap-4 mb-1">
        <label for="startTime" class="font-semibold w-24">Start Time</label>
        <DatePicker
          name="startTime"
          :modelValue="$form.startTime?.value ?? null"
          @update:modelValue="(val) => { if ($form.startTime) $form.startTime.value = val }"
          class="flex-auto"
          show-time
          hour-format="24"
        />
      </div>
      <Message v-if="$form.startTime?.invalid" severity="error" size="small" variant="simple" class="ml-28">
        {{ $form.startTime.error?.message }}
      </Message>
    </div>
    
    <div class="mb-4">
      <div class="flex items-center gap-4 mb-2">
        <label for="endTime" class="font-semibold w-24">End Time</label>
        <DatePicker
          name="endTime"
          :modelValue="$form.endTime?.value ?? null"
          @update:modelValue="(val) => { if ($form.endTime) $form.endTime.value = val }"
          class="flex-auto"
          show-time
          hour-format="24"
        />
      </div>
      <Message v-if="$form.endTime?.invalid" severity="error" size="small" variant="simple" class="ml-28">
        {{ $form.endTime.error?.message }}
      </Message>
    </div>
    
    <div class="text-center">
      <RouterLink to="/manage/vote" class="mr-4 text-gray-500 hover:underline">Back</RouterLink>
      <Button type="submit" :loading="submitting" :label="submitText" severity="Success" icon="pi pi-save" />
    </div>
  </Form>
</template>

<script setup>
import { Form } from '@primevue/forms';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message'
import { computed } from 'vue'

const props = defineProps({
  initialValues: { type: Object, required: true },
  submitting: { type: Boolean, default: false },
  submitText: { type: String, default: 'Save' },
  resolver: { type: Function, required: true }
})

const emit = defineEmits(['submit']);

const submitText = computed(() => props.submitText);

function onSubmit({ valid, values }) {
  emit('submit', { valid, values })
}
</script>