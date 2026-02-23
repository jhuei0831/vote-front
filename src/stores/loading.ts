import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // State
  const isLoading = ref<boolean>(false)
  const loadingMessage = ref<string>('Loading...')

  // Actions
  const show = (message: string = 'Loading...') => {
    loadingMessage.value = message
    isLoading.value = true
  }

  const hide = () => {
    isLoading.value = false
  }

  return {
    isLoading,
    loadingMessage,
    show,
    hide
  }
})
