<template>
  <Form 
    :initialValues="initialValues"
    :resolver="resolver"
    :uuid="uuid"
    :submit="handleCreate"
  />
</template>

<script>
import Form from '@/components/candidate/Form.vue';
import { CANDIDATE_CREATE, CANDIDATE_LIST } from '@/graphql/candidate.js';
import { useLoadingStore } from '@/stores/loading';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

export default {
  components: {
    Form
  },
  setup() {
    const loadingStore = useLoadingStore();
    return { loadingStore };
  },
  props: {
    uuid: {
      type: String,
      required: true
    }
  },
  data: () => ({
    isSubmitting: false,
  }),
  computed: {
    initialValues() {
      return {
        questionId: 0,
        name: '',
      };
    },
    resolver() {
      return zodResolver(
        z.object({
          questionId: z.number({ invalid_type_error: 'Question is required.' }),
          name: z.string().min(1, { message: 'Name is required.' }),
        })
      );
    },
  },
  methods: {
    async handleCreate({ valid, values }) {
      // 檢查表單是否有效
      if (!valid) {
        return;
      }
      
      // 防止重複提交
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;
      this.loadingStore.show('建立候選人中...');

      try {
        const result = await this.$apollo.mutate({
          mutation: CANDIDATE_CREATE,
          variables: {
            candidate: {
              questionId: values.questionId,
              name: values.name,
            }
          },
          // 更新 Apollo 緩存
          refetchQueries: [
            {
              query: CANDIDATE_LIST,
              variables: {
                query: {
                  voteId: this.uuid,
                  first: 999
                },
              }
            }
          ]
        });
        
        this.$toast.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Candidate created successfully', 
          life: 3000
        });
        
        // 導航回列表頁
        this.$router.push(`/manage/candidate/${this.uuid}`);
      } catch (error) {
        console.error('Error creating candidate:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message || 'Error creating candidate', 
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