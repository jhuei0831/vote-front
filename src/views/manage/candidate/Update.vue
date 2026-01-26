<template>
  <Form 
    :key="candidateForm.name"
    :initialValues="initialValues" 
    :resolver="resolver"
    :uuid="uuid"
    :submit="handleUpdate"
  />
</template>

<script>
import Form from '@/components/candidate/Form.vue';
import { CANDIDATE_UPDATE } from '@/api/candidate.js';
import { useLoadingStore } from '@/stores/loading';
import { useCandidateStore } from '@/stores/candidate';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

export default {
  components: {
    Form
  },
  setup() {
    const loadingStore = useLoadingStore();
    const candidateStore = useCandidateStore();
    return { loadingStore, candidateStore };
  },
  props: {
    uuid: {
      type: String,
      required: true
    },
    id: {
      type: [String, Number],
      required: true
    }
  },
  data: () => ({
    candidateForm: {
      questionId: 0,
      name: '',
    },
    isSubmitting: false,
  }),
  async mounted() {
    await this.fetchCandidateData();
  },
  computed: {
    candidateId() {
      return typeof this.id === 'string' ? parseInt(this.id, 10) : this.id;
    },
    initialValues() {
      return {
        questionId: this.candidateForm.questionId ?? 0,
        name: this.candidateForm.name ?? '',
      };
    },
    resolver() {
      return zodResolver(
        z.object({
          questionId: z.number({ invalid_type_error: 'Question is required.' }),
          name: z.string().min(1, { message: 'Name is required.' }),
        })
      );
    }
  },
  methods: {
    async fetchCandidateData() {
      this.loadingStore.show('載入候選人資料...');
      try {
        const candidate = await this.candidateStore.fetchCandidate(this.candidateId);
        
        if (candidate) {
          this.candidateForm.questionId = candidate.questionId || 0;
          this.candidateForm.name = candidate.name || '';
        }
      } catch (error) {
        console.error('Error fetching candidate:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Error loading candidate data', 
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
      this.loadingStore.show('更新候選人中...');

      try {
        const result = await this.$apollo.mutate({
          mutation: CANDIDATE_UPDATE,
          variables: {
            id: this.candidateId,
            candidate: {
              questionId: values.questionId,
              name: values.name,
            }
          },
        });
        
        console.log('Mutation result:', result);
        
        this.$toast.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Candidate updated successfully', 
          life: 3000
        });

      } catch (error) {
        console.error('Error updating candidate:', error);
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: error.message || 'Error updating candidate', 
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