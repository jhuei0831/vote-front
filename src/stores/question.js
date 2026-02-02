import { ref, reactive, computed } from "vue";
import { defineStore } from "pinia";
import { apolloProvider } from "@/api/apollo";
import { 
  QUESTION_VIEW, 
  QUESTION_LIST, 
  QUESTION_CREATE, 
  QUESTION_UPDATE,
  QUESTION_OPTIONS 
} from "@/graphql/question";

export const useQuestionStore = defineStore("question", () => {
  // State
  const questions = ref([]);
  const state = reactive({
    uuid: null,
    id: null,
    isEdit: false,
    initialValues: {
      title: '',
      description: ''
    },
    loadingInitial: false,
    submitting: false,
    error: null,
  });

  // Getters
  const questionOptions = computed(() => {
    return questions.value.map(question => ({
      label: question.title,
      value: question.id
    }));
  });

  const questionMap = computed(() => {
    return new Map(
      questions.value.map(q => [q.id, q.title])
    );
  });

  const modeLabel = computed(() => (state.isEdit ? 'Update' : 'Create'))

  // Actions
  async function init(uuid, id) {
    // Initialize: set mode & load initial values (only in edit mode)
    state.uuid = uuid ?? null
    state.id = id ?? null
    state.isEdit = !!id
    state.error = null

    if (!state.isEdit) {
      console.log('Create mode - setting empty initial values');
      state.initialValues = { title: '', description: ''}
      return
    }

    console.log('Edit mode - fetching data for uuid:', uuid, 'and id:', id);
    state.loadingInitial = true
    
    try {
      const { data } = await apolloProvider.defaultClient.query({
        query: QUESTION_VIEW,
        variables: {
          id,
          withCandidates: false
        },
        fetchPolicy: 'network-only',
      })
      
      const v = data?.question
      
      state.initialValues = v
        ? { 
            title: v.title, 
            description: v.description
          }
        : { title: '', description: '' }
        
      console.log('Final initialValues:', state.initialValues);
    } catch (e) {
      console.error('Error in init:', e);
      state.error = e
    } finally {
      state.loadingInitial = false
    }
  }

  async function submit(values) {
    state.submitting = true
    state.error = null
    try {
      if (!state.isEdit) {
        // Create
        const res = await apolloProvider.defaultClient.mutate({
          mutation: QUESTION_CREATE,
          variables: { 
            input: {
              voteId: state.uuid,
              title: values.title,
              description: values.description,
            }
          }
        })
        return res.data?.createQuestion
      } else {
        // Update
        const res = await apolloProvider.defaultClient.mutate({
          mutation: QUESTION_UPDATE,
          variables: { 
            id: state.id,
            input: {
              voteId: state.uuid,
              title: values.title,
              description: values.description,
            }
          },
          refetchQueries: [
            { 
              query: QUESTION_LIST, 
              variables: {
                questionQuery: {
                  voteId: state.uuid,
                  first: 999
                },
                withCandidates: false  
              }
            },
            { 
              query: QUESTION_VIEW, 
              variables: { 
                id: state.id,
                withCandidates: false
              } 
            },
          ],
          optimisticResponse: {
            updateQuestion: { 
              __typename: 'Question',
              id: state.id, 
              voteId: state.uuid,
              title: values.title, 
              description: values.description,
              createdAt: '',
              updatedAt: '',
            },
          }
        })
        return res.data?.updateQuestion
      }
    } catch (e) {
      state.error = e
      throw e
    } finally {
      state.submitting = false
    }
  }

  function reset() {
    state.uuid = null
    state.id = null
    state.isEdit = false
    state.initialValues = { title: '', description: '' }
    state.loadingInitial = false
    state.submitting = false
    state.error = null
  }

  async function fetchQuestion(id) {
    if (!id) return;
        
    try {
      const result = await apolloProvider.defaultClient.query({
        query: QUESTION_VIEW,
        variables: {
          id,
          withCandidates: false
        }
      });
      
      return result.data?.question;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    } finally {
    }
  }

  async function fetchQuestionOptions(uuid) {
    if (!uuid) return;
        
    try {
      const result = await apolloProvider.defaultClient.query({
        query: QUESTION_OPTIONS,
        variables: {
          voteId: uuid,
        },
        fetchPolicy: 'network-only',
      });
      
      questions.value = result.data?.questionOptions?.options;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  return {
    // state
    questions,
    state,
    // getters
    modeLabel,
    questionOptions,
    questionMap,
    // actions
    init,
    submit,
    reset,
    fetchQuestion,
    fetchQuestionOptions,
  };
});