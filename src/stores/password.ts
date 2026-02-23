import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePasswordStore = defineStore('password', () => {
  // State
  const password = ref<string>('')

  // Actions
  const setPassword = (newPassword: string) => {
    password.value = newPassword
  }

  return {
    password,
    setPassword
  }
})