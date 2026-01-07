<template>
  <Sidebar />
  <main class="py-10 lg:pl-72">
    <Toast />
    <div class="px-4 sm:px-6 lg:px-8">
      <RouterView />
    </div>
  </main>
</template>

<script setup>
import Sidebar from '@/components/layout/Sidebar.vue';

</script>
