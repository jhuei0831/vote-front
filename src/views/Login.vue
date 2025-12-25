<template>
  <div class="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-10">
      <div>
        <img class="mx-auto h-10 w-auto dark:hidden" :src="logoImg" alt="vote" />
        <img class="mx-auto h-10 w-auto not-dark:hidden" :src="logoImg" alt="vote" />
        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in</h2>
      </div>
      <form class="space-y-6" @submit.prevent="handleLogin">
        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-800">{{ errorMessage }}</p>
        </div>

        <div>
          <div class="col-span-2">
            <input 
              id="account" 
              v-model="formData.account"
              name="account" 
              type="text" 
              autocomplete="account" 
              required 
              aria-label="Account" 
              class="block w-full rounded-t-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" 
              placeholder="Account" 
            />
          </div>
          <div class="-mt-px">
            <input 
              id="password" 
              v-model="formData.password"
              name="password" 
              type="password" 
              autocomplete="current-password" 
              required 
              aria-label="Password" 
              class="block w-full rounded-b-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" 
              placeholder="Password" 
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex gap-3">
            <div class="flex h-6 shrink-0 items-center">
              <div class="group grid size-4 grid-cols-1">
                <input 
                  id="remember-me" 
                  v-model="formData.rememberMe"
                  name="remember-me" 
                  type="checkbox" 
                  class="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto" 
                />
                <svg class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25" viewBox="0 0 14 14" fill="none">
                  <path class="opacity-0 group-has-checked:opacity-100" d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path class="opacity-0 group-has-indeterminate:opacity-100" d="M3 7H11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <label for="remember-me" class="block text-sm/6 text-gray-900">Remember me</label>
          </div>

          <div class="text-sm/6">
            <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="authStore.isLoading"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ authStore.isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImg from '@/assets/grapes.png'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  account: '',
  password: '',
  rememberMe: false
})

const errorMessage = ref('')

const handleLogin = async () => {
  try {
    errorMessage.value = ''

    await authStore.login({
      account: formData.value.account,
      password: formData.value.password,
      rememberMe: formData.value.rememberMe
    })

    // 登入成功，導向首頁或其他頁面
    router.push('/')
  } catch (error) {
    // 顯示錯誤訊息
    errorMessage.value = error.response?.data?.message || '登入失敗，請檢查您的帳號密碼'
  }
}
</script>