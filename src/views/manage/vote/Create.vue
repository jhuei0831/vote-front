<template>
  <Form 
    :voteForm="voteForm"
    :initialValues="voteForm" 
    :resolver="resolver" 
    @submit="handleCreate"
  />
</template>

<script>
import Form from '@/components/vote/Form.vue';
import {  VOTE_CREATE } from '@/api/vote.js';

export default {
  components: {
    Form
  },
  data: () => ({
    voteForm: {
      title: '',
      description: '',
      startTime: null,
      endTime: null
    },
    isSubmitting: false
  }),
  methods: {
    resolver: ({ values }) => {
      const errors = {};

      if (!values.title) {
        errors.title = [{ message: 'Title is required.' }];
      }

      return {
        values,
        errors
      };
    },
    async handleCreate() {
      // 防止重複提交
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        const result = await this.$apollo.mutate({
          mutation: VOTE_CREATE,
          variables: {
            input: {
              title: this.voteForm.title,
              description: this.voteForm.description,
              startTime: this.voteForm.startTime,
              endTime: this.voteForm.endTime
            }
          },
        });
        
        console.log('Mutation result:', result);
        
        // clear form
        this.voteForm.title = '';
        this.voteForm.description = '';
        this.voteForm.startTime = null;
        this.voteForm.endTime = null;
        
        this.$toast.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Vote created successfully', 
          life: 3000
        });
      } catch (error) {
        console.error('Error creating vote:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message || 'Error creating vote', 
          life: 3000
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>