<template>
  <Sidebar />
  <main class="py-10 lg:pl-72">
    <Toast />
    <div class="px-4 sm:px-6 lg:px-8">
      <RouterView />
    </div>
    
    <!-- Loading Mask -->
    <div 
      v-show="loadingStore.isLoading" 
      class="fixed inset-0 z-9999 flex items-center justify-center bg-opacity-50"
      style="backdrop-filter: blur(2px);"
    >
      <div class="flex flex-col items-center">
        <ProgressSpinner 
          style="width: 60px; height: 60px" 
          strokeWidth="4" 
          fill="transparent"
          animationDuration="1s"
        />
        <p class="mt-4 text-white text-lg font-medium">{{ loadingStore.loadingMessage }}</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import Sidebar from '@/components/layout/Sidebar.vue';
import { useLoadingStore } from '@/stores/loading';

const loadingStore = useLoadingStore();
</script>
