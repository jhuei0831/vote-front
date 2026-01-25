<template>
  <PrimeForm v-slot="$form" :initialValues :resolver @submit="submit" class="flex flex-col gap-4 w-full">
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
    <FormField v-slot="$field" name="description" :initialValue="initialValues?.description || ''" class="mb-4">
      <div class="flex items-center gap-4 mb-1">
        <label for="description" class="font-semibold w-24">Description</label>
        <Editor id="description" v-model="$field.value" class="flex-auto" rows="4" @text-change="$field.onInput" @blur="$field.onBlur" />
      </div>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple" class="ml-28">
        {{ $field.error?.message }}
      </Message>
    </FormField>
    <div class="text-center">
      <RouterLink :to="`/manage/question/${uuid}`" class="mr-4 text-gray-500 hover:underline">Back</RouterLink>
      <Button type="submit" severity="Success" label="Submit" />
    </div>
  </PrimeForm>
</template>

<script>
import { Form as PrimeForm, FormField } from '@primevue/forms';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import Message from 'primevue/message';

export default {
  components: {
    PrimeForm,
    FormField,
    Button,
    InputText,
    Editor,
    Message
  },
  props: {
    initialValues: Object,
    resolver: Function,
    submit: Function,
    uuid: String
  }
}
</script>