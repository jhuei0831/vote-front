<template>
  <PrimeForm v-slot="$form" :initialValues :resolver @submit="onSubmit" class="flex flex-col gap-4 w-full">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Enter vote information.</span>
    <div class="flex items-center gap-4 mb-4">
      <label for="title" class="font-semibold w-24">Title</label>
      <InputText id="title" class="flex-auto" autocomplete="off" v-model="voteForm.title" />
    </div>
    <div class="flex items-center gap-4 mb-4">
      <label for="description" class="font-semibold w-24">Description</label>
      <Editor id="description" class="flex-auto" rows="4" v-model="voteForm.description" />
    </div>
    <div class="flex items-center gap-4 mb-4">
      <label for="startTime" class="font-semibold w-24">Start Time</label>
      <DatePicker id="startTime" class="flex-auto" show-time hour-format="24" v-model="voteForm.startTime" />
    </div>
    <div class="flex items-center gap-4 mb-2">
      <label for="endTime" class="font-semibold w-24">End Time</label>
      <DatePicker id="endTime" class="flex-auto" show-time hour-format="24" v-model="voteForm.endTime" />
    </div>
    <div class="text-center">
      <RouterLink to="/manage/vote" class="mr-4 text-gray-500 hover:underline">Back</RouterLink>
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
    voteForm: Object,
    initialValues: Object,
    resolver: Function
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
      this.$emit('submit', event);
    }
  }
}
</script>