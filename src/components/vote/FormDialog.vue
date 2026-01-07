<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    header="Create New Vote" 
    :style="{ width: '50rem' }"
  >
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Enter vote information.</span>
    <div class="flex items-center gap-4 mb-4">
      <label for="title" class="font-semibold w-24">Title</label>
      <InputText id="title" class="flex-auto" autocomplete="off" v-model="title" />
    </div>
    <div class="flex items-center gap-4 mb-4">
      <label for="description" class="font-semibold w-24">Description</label>
      <Textarea id="description" class="flex-auto" rows="4" v-model="description" />
    </div>
    <div class="flex items-center gap-4 mb-4">
      <label for="startTime" class="font-semibold w-24">Start Time</label>
      <DatePicker id="startTime" class="flex-auto" show-time hour-format="24" v-model="startTime" />
    </div>
    <div class="flex items-center gap-4 mb-2">
      <label for="endTime" class="font-semibold w-24">End Time</label>
      <DatePicker id="endTime" class="flex-auto" show-time hour-format="24" v-model="endTime" />
    </div>
    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="$emit('update:visible', false)" />
      <Button label="Create" severity="primary" @click="handleCreate" />
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import { VOTE_VIEW, VOTE_CREATE } from '@/api/vote.js';

export default {
  components: {
    Dialog,
    Button,
    InputText,
    Textarea,
    DatePicker
  },
  data() {
    return {
      title: '',
      description: '',
      startTime: null,
      endTime: null
    };
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible'],
  methods: {
    handleCreate() {
      try {
        this.$apollo.mutate({
          mutation: VOTE_CREATE,
          variables: {
            input: {
              title: this.title,
              description: this.description,
              startTime: this.startTime,
              endTime: this.endTime
            }
          },
          update: (store, { data: { createVote } }) => {
            const data = store.readQuery({
              query: VOTE_VIEW,
              variables: { vote: {first: 999}, withQuestions: false }
            });
            const updatedData = {
              ...data,
              votes: data.votes.map((vote, index) => 
                index === 0 
                  ? { ...vote, edges: [{ __typename: 'VoteEdge', cursor: createVote.id, node: createVote }, ...vote.edges] }
                  : vote
              )
            };
            store.writeQuery({
              query: VOTE_VIEW,
              data: updatedData,
              variables: { vote: {first: 999}, withQuestions: false }
            });
          }
        });
        // clear form
        this.title = '';
        this.description = '';
        this.startTime = null;
        this.endTime = null;
        this.$toast.add({ severity: 'success', summary: 'Info', detail: 'Vote created successfully', life: 3000 });
      } catch (error) {
        console.error('Error creating vote:', error);
      }
      this.$emit('update:visible', false);
    }
  }
}
</script>