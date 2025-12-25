import { createWebHistory, createRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Manage from '@/Manage.vue'
import Dashboard from '@/views/manage/Dashboard.vue'
import Vote from '@/views/manage/Vote.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  { 
    path: '/', component: Home, 
    meta: { requiresAuth: true } 
  },
  { path: '/login', component: Login },
  { 
    path: '/manage', component: Manage,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'vote', component: Vote },
    ], 
  },
  { 
    path: '/:pathMatch(.*)*', 
    component: NotFound 
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 導航守衛：驗證登入狀態
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化認證狀態（只在第一次載入時）
  if (!authStore.token && localStorage.getItem('token')) {
    authStore.initAuth()
  }
  
  // 檢查是否需要登入
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 未登入，導向登入頁
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // 已登入，嘗試訪問登入頁，導向首頁
    next('/')
  } else {
    next()
  }
})