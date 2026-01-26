<template>
  <PrimeForm v-slot="$form" :initialValues :resolver @submit="submit" class="flex flex-col gap-4 w-full">
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
      <Button type="submit" severity="Success" label="Submit" />
    </div>
  </PrimeForm>
</template>

<script>
import { Form as PrimeForm, FormField } from '@primevue/forms';
import { useQuestionStore } from '@/stores/question';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';

export default {
  components: {
    PrimeForm,
    FormField,
    Button,
    InputText,
    Message,
    Select
  },
  props: {
    initialValues: Object,
    resolver: Function,
    submit: Function,
    uuid: String
  },
  setup() {
    const questionStore = useQuestionStore();
    
    return {
      questionStore,
    };
  }
}
</script>