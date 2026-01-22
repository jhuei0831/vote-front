<template>
  <PrimeForm v-slot="$form" :initialValues :resolver @submit="onSubmit" class="flex flex-col gap-4 w-full">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Enter question information.</span>
    <div class="flex items-center gap-4 mb-4">
      <label for="title" class="font-semibold w-24">Title</label>
      <InputText id="title" class="flex-auto" autocomplete="off" v-model="questionForm.title" />
      <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">{{ $form.title.error?.message }}</Message>
    </div>
    <div class="flex items-center gap-4 mb-4">
      <label for="description" class="font-semibold w-24">Description</label>
      <Editor id="description" class="flex-auto" rows="4" v-model="questionForm.description" />
      <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">{{ $form.description.error?.message }}</Message>
    </div>
    <div class="text-center">
      <RouterLink :to="`/manage/question/${uuid}`" class="mr-4 text-gray-500 hover:underline">Back</RouterLink>
      <Button type="submit" severity="Success" label="Submit" />
    </div>
  </PrimeForm>
</template>

<script>
import { Form as PrimeForm } from '@primevue/forms';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import DatePicker from 'primevue/datepicker';

export default {
  components: {
    PrimeForm,
    Button,
    InputText,
    Editor,
    DatePicker
  },
  props: {
    questionForm: Object,
    initialValues: Object,
    resolver: Function,
    uuid: String
  },
  methods: {
    onSubmit(event) {
      // 防止事件重複觸發
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      if (event.valid) {
        this.$emit('submit', event);
      }
    }
  }
}
</script>