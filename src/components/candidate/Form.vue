<template>
  <PrimeForm v-slot="$form" :initialValues :resolver @submit="onSubmit" class="flex flex-col gap-4 w-full">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Enter candidate information.</span>
    <div class="mb-4">
      <div class="flex items-center gap-4 mb-1">
      <label for="questionId" class="font-semibold w-24">Question</label>
      <Select 
        id="questionId" 
        name="questionId" 
        class="flex-auto" 
        :options="questionStore.questionOptions" 
        optionLabel="label" 
        optionValue="value" 
        placeholder="Select a Question" 
        fluid 
      />
      </div>
      <Message v-if="$form.questionId?.invalid" severity="error" size="small" variant="simple" class="ml-28">
      {{ $form.questionId.error?.message }}
      </Message>
    </div>
    <div class="mb-4">
      <div class="flex items-center gap-4 mb-1">
        <label for="name" class="font-semibold w-24">Name</label>
        <InputText id="name" name="name" class="flex-auto" autocomplete="off" fluid />
      </div>
      <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple" class="ml-28">
        {{ $form.name.error?.message }}
      </Message>
    </div>
    <div class="text-center">
      <RouterLink :to="`/manage/candidate/${uuid}`" class="mr-4 text-gray-500 hover:underline">Back</RouterLink>
      <Button type="submit" :loading="submitting" :label="submitText" severity="Success" icon="pi pi-save" />
    </div>
  </PrimeForm>
</template>

<script setup>
import { Form as PrimeForm } from '@primevue/forms';
import { useQuestionStore } from '@/stores/question';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import { computed } from 'vue'

const questionStore = useQuestionStore();

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