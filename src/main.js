import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from '@/route/index.js'
import { apolloProvider } from '@/api/graphql.js'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Aura from '@primeuix/themes/aura';
import '@/style.css'
import App from '@/App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(apolloProvider)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
    },
})
app.use(ToastService);
app.component('Toast', Toast);
app.mount('#app')
