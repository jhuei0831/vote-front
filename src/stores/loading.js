import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // State
  const isLoading = ref(false)
  const loadingMessage = ref('載入中...')

  // Actions
  const show = (message = '載入中...') => {
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
