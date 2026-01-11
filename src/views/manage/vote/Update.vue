<template>
  <Form 
    :voteForm="voteForm"
    :initialValues="voteForm" 
    :resolver="resolver" 
    @submit="handleUpdate"
  />
</template>

<script>
import Form from '@/components/vote/Form.vue';
import { VOTE_VIEW, VOTE_UPDATE } from '@/api/vote.js';

export default {
  components: {
    Form
  },
  props: {
    uuid: {
      type: String,
      required: true
    }
  },
  data: () => ({
    voteForm: {
      title: '',
      description: '',
      startTime: null,
      endTime: null
    },
    isSubmitting: false,
    isLoading: true
  }),
  async mounted() {
    await this.fetchVoteData();
  },
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
    async fetchVoteData() {
      try {
        const result = await this.$apollo.query({
          query: VOTE_VIEW,
          variables: {
            uuid: this.uuid,
            withQuestions: false
          }
        });

        const vote = result.data.vote;
        
        if (vote) {
          this.voteForm.title = vote.title || '';
          this.voteForm.description = vote.description || '';
          this.voteForm.startTime = vote.startTime ? new Date(vote.startTime) : null;
          this.voteForm.endTime = vote.endTime ? new Date(vote.endTime) : null;
        }
      } catch (error) {
        console.error('Error fetching vote:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Error loading vote data', 
          life: 3000
        });
      } finally {
        this.isLoading = false;
      }
    },
    async handleUpdate() {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        const result = await this.$apollo.mutate({
          mutation: VOTE_UPDATE,
          variables: {
            uuid: this.uuid,
            vote: {
              title: this.voteForm.title,
              description: this.voteForm.description,
              startTime: this.voteForm.startTime ? this.voteForm.startTime.toISOString() : null,
              endTime: this.voteForm.endTime ? this.voteForm.endTime.toISOString() : null
            }
          },
        });
        
        console.log('Mutation result:', result);
        
        this.$toast.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Vote updated successfully', 
          life: 3000
        });

      } catch (error) {
        console.error('Error updating vote:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message || 'Error updating vote', 
          life: 3000
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>