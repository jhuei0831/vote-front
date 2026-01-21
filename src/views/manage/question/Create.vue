<template>
  <Form 
    :questionForm="questionForm"
    :initialValues="questionForm" 
    :resolver="resolver",
    :uuid="uuid"
    @submit="handleCreate"
  />
</template>

<script>
import Form from '@/components/question/Form.vue';
import { QUESTION_CREATE, QUESTION_LIST } from '@/api/question.js';

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
    questionForm: {
      title: '',
      description: '',
    },
    isSubmitting: false
  }),
  methods: {
    resolver: ({ values }) => {
      const errors = {};

      if (!values.title) {
        errors.title = [{ message: 'Title is required.' }];
      }
      
      if (!values.description) {
        errors.description = [{ message: 'Description is required.' }];
      }
      
      return {
        values,
        errors
      };
    },
    async handleCreate(event) {
      // 防止重複提交
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        const result = await this.$apollo.mutate({
          mutation: QUESTION_CREATE,
          variables: {
            input: {
              voteId: this.uuid,
              title: this.questionForm.title,
              description: this.questionForm.description,
            }
          },
          // 更新 Apollo 緩存
          refetchQueries: [
            {
              query: QUESTION_LIST,
              variables: {
                questionQuery: {
                  voteId: this.uuid,
                  first: 999
                },
                withCandidates: false
              }
            }
          ]
        });
        
        console.log('Mutation result:', result);
        
        this.$toast.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Question created successfully', 
          life: 3000
        });
        
        // 導航回列表頁
        this.$router.push(`/manage/question/${this.uuid}`);
      } catch (error) {
        console.error('Error creating question:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message || 'Error creating question', 
          life: 3000
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>