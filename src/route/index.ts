import { createWebHistory, createRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePollStore } from '@/stores/poll'

// poll-option route guard to fetch poll options before entering
const pollOptionBeforeEnter = async (to: any) => {
  const pollStore = usePollStore();
  await pollStore.fetchPollList(to.params.uuid);
}

const routes = [
  { 
    path: '/', 
    component: () => import('@/views/Home.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/login', 
    component: () => import('@/views/Login.vue') 
  },
  { 
    path: '/manage', 
    component: () => import('@/Manage.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'dashboard', 
        component: () => import('@/views/manage/Dashboard.vue') 
      },
      { 
        path: 'session',
        component: () => import('@/views/manage/session/Index.vue') 
      },
      { 
        path: 'session/upsert/:uuid?', 
        component: () => import('@/views/manage/session/Upsert.vue'), 
        props: true 
      },
      { 
        path: 'poll/:uuid', 
        component: () => import('@/views/manage/poll/Index.vue'), 
        props: true 
      },
      { 
        path: 'poll/:uuid/upsert/:id?', 
        component: () => import('@/views/manage/poll/Upsert.vue'), 
        props: true 
      },
      { 
        path: 'poll-option/:uuid', 
        component: () => import('@/views/manage/pollOption/Index.vue'), 
        props: true,
        beforeEnter: pollOptionBeforeEnter,
      },
      { 
        path: 'poll-option/:uuid/upsert/:id?', 
        component: () => import('@/views/manage/pollOption/Upsert.vue'), 
        props: true,
        beforeEnter: pollOptionBeforeEnter,
      },
      {
        path: 'invitation/:uuid',
        component: () => import('@/views/manage/invitation/Index.vue'),
        props: true,
      }
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

// Navigation guard: verify authentication state
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize authentication state (only on first load)
  if (!authStore.token && localStorage.getItem('token')) {
    authStore.initAuth()
  }
  
  // Check if authentication is required
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Not authenticated, redirect to login page
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Already authenticated, trying to access login page, redirect to home
    next('/')
  } else {
    next()
  }
})