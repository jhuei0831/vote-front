<template>
  <Form 
    :key="questionForm.title"
    :initialValues="initialValues" 
    :resolver="resolver"
    :uuid="uuid"
    :submit="handleUpdate"
  />
</template>

<script>
import Form from '@/components/question/Form.vue';
import { QUESTION_UPDATE } from '@/graphql/question.js';
import { useLoadingStore } from '@/stores/loading';
import { useQuestionStore } from '@/stores/question';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

export default {
  components: {
    Form
  },
  setup() {
    const loadingStore = useLoadingStore();
    const questionStore = useQuestionStore();
    return { loadingStore, questionStore };
  },
  props: {
    uuid: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  data: () => ({
    questionForm: {
      title: '',
      description: '',
    },
    isSubmitting: false,
  }),
  async mounted() {
    await this.fetchQuestionData();
  },
  computed: {
    initialValues() {
      return {
        title: this.questionForm.title ?? '',
        description: this.questionForm.description ?? '',
      };
    },
    resolver() {
      return zodResolver(
        z.object({
          title: z.string().min(1, { message: 'Title is required.' }),
          description: z.string().optional(),
        })
      );
    }
  },
  methods: {
    async fetchQuestionData() {
      this.loadingStore.show('載入投票資料...');
      try {
        const question = await this.questionStore.fetchQuestion(this.id);
        
        if (question) {
          this.questionForm.title = question.title || '';
          this.questionForm.description = question.description || '';
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Error loading question data', 
          life: 3000
        });
      } finally {
        this.loadingStore.hide();
      }
    },
    async handleUpdate({ valid, values }) {
      // 檢查表單是否有效
      if (!valid) {
        console.log('Form validation failed');
        return;
      }
      
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;
      this.loadingStore.show('更新問題中...');

      try {
        const result = await this.$apollo.mutate({
          mutation: QUESTION_UPDATE,
          variables: {
            id: this.id,
            input: {
              voteId: this.uuid,
              title: values.title,
              description: values.description,
            }
          },
        });
        
        console.log('Mutation result:', result);
        
        this.$toast.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Question updated successfully', 
          life: 3000
        });

      } catch (error) {
        console.error('Error updating question:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message || 'Error updating question', 
          life: 3000
        });
      } finally {
        this.loadingStore.hide();
        this.isSubmitting = false;
      }
    }
  }
};
</script>