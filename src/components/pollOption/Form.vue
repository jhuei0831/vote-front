<template>
  <PrimeForm v-slot="$form" :initialValues :resolver @submit="onSubmit" class="flex flex-col gap-4 w-full">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Enter poll option information.</span>
    <div class="mb-4">
      <div class="flex items-center gap-4 mb-1">
      <label for="pollId" class="font-semibold w-24">Poll</label>
      <Select 
        id="pollId" 
        name="pollId" 
        class="flex-auto" 
        :options="pollStore.pollOptions" 
        optionLabel="label" 
        optionValue="value" 
        placeholder="Select a Poll" 
        fluid 
      />
      </div>
      <Message v-if="$form.pollId?.invalid" severity="error" size="small" variant="simple" class="ml-28">
      {{ $form.pollId.error?.message }}
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
      <RouterLink :to="`/manage/poll-option/${uuid}`" class="mr-4 text-gray-500 hover:underline">Back</RouterLink>
      <Button type="submit" :loading="submitting" :label="submitText" severity="Success" icon="pi pi-save" />
    </div>
  </PrimeForm>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';

import { PollOptionState } from '@/stores/pollOption';
import { usePollStore } from '@/stores/poll';
import { Form as PrimeForm, FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';

const pollStore = usePollStore();

interface Props {
  uuid: string
  initialValues: PollOptionState['initialValues']
  submitting?: boolean
  submitText?: string
  resolver: ReturnType<typeof zodResolver>
}

const props = withDefaults(defineProps<Props>(), {
  submitting: false,
  submitText: 'Save'
})

const emit = defineEmits(['submit']);

const submitText = computed(() => props.submitText);
const uuid = computed(() => props.uuid);

function onSubmit(event: FormSubmitEvent) {
  emit('submit', { valid: event.valid, values: event.values });
}
</script>