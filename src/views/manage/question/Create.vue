<template>
  <Form 
    :initialValues="initialValues" 
    :resolver="resolver"
    :uuid="uuid"
    :submit="handleCreate"
  />
</template>

<script>
import Form from '@/components/question/Form.vue';
import { QUESTION_CREATE, QUESTION_LIST } from '@/api/question.js';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

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
    isSubmitting: false
  }),
  computed: {
    initialValues() {
      return {
        title: '',
        description: '',
      };
    },
    resolver() {
      return zodResolver(
        z.object({
          title: z.string().min(1, { message: 'Title is required.' }),
        })
      );
    }
  },
  methods: {
    async handleCreate({ valid, values }) {
      // 檢查表單是否有效
      if (!valid) {
        console.log('Form validation failed');
        return;
      }
      
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
              title: values.title,
              description: values.description,
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