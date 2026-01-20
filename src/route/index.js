import { createWebHistory, createRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'


const routes = [
  { 
    path: '/', component: () => import('@/views/Home.vue'), 
    meta: { requiresAuth: true } 
  },
  { path: '/login', component: () => import('@/views/Login.vue') },
  { 
    path: '/manage', component: () => import('@/Manage.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: () => import('@/views/manage/Dashboard.vue') },
      { path: 'vote', component: () => import('@/views/manage/vote/Index.vue') },
      { path: 'vote/create', component: () => import('@/views/manage/vote/Create.vue') },
      { path: 'vote/update/:uuid', component: () => import('@/views/manage/vote/Update.vue'), props: true },
      { path: 'question/:uuid', component: () => import('@/views/manage/question/Index.vue'), props: true },
      // { path: 'question/create', component: () => import('@/views/manage/question/Create.vue') },
      // { path: 'question/update/:uuid', component: () => import('@/views/manage/question/Update.vue'), props: true }
    ], 
  },
  { 
    path: '/:pathMatch(.*)*', 
    component: () => import('@/views/NotFound.vue')
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