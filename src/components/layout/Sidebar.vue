<template>
  <TransitionRoot as="template" :show="sidebarOpen">
    <Dialog class="relative z-50 lg:hidden" @close="sidebarOpen = false">
      <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0" enter-to="" leave="transition-opacity ease-linear duration-300" leave-from="" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/80"></div>
      </TransitionChild>

      <div class="fixed inset-0 flex">
        <TransitionChild as="template" enter="transition ease-in-out duration-300 transform" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0" leave-to="-translate-x-full">
          <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
            <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="" leave="ease-in-out duration-300" leave-from="" leave-to="opacity-0">
              <div class="absolute top-0 left-full flex w-16 justify-center pt-5">
                <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                  <span class="sr-only">Close sidebar</span>
                  <XMarkIcon class="size-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>

            <!-- Sidebar component, swap this element with another sidebar if you like -->
            <div class="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
              <div class="relative flex h-16 shrink-0 items-center">
                <img class="h-8 w-auto" :src="logoImg" alt="vote" />
              </div>
              <nav class="relative flex flex-1 flex-col">
                <ul role="list" class="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" class="-mx-2 space-y-1">
                      <li v-for="item in navigation" :key="item.name">
                        <RouterLink :to="item.href" :class="[currentPath == item.href ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                          <component :is="item.icon" :class="[currentPath == item.href ? 'text-amber-700' : 'text-gray-400 group-hover:text-amber-700', 'size-6 shrink-0']" aria-hidden="true" />
                          {{ item.name }}
                        </RouterLink>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <div v-if="voteStore.voteExists">
                      <div class="text-xs/6 font-semibold text-gray-400">{{ vote?.title}}</div>
                      <ul role="list" class="-mx-2 mt-2 space-y-1">
                        <li v-for="category in categories" :key="category.name">
                          <RouterLink :to="category.href" :class="[currentPath == category.href ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                            <span :class="[currentPath == category.href ? 'border-amber-700 text-amber-700' : 'border-gray-200 text-gray-400 group-hover:border-amber-700 group-hover:text-amber-700', 'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium']">{{ category.initial }}</span>
                            <span class="truncate">{{ category.name }}</span>
                          </RouterLink>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Static sidebar for desktop -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
      <div class="flex h-16 shrink-0 items-center">
        <RouterLink to="/">
          <img class="h-8 w-auto" :src="logoImg" alt="vote" />
        </RouterLink>
      </div>
      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" class="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" class="-mx-2 space-y-1">
                  <li v-for="item in navigation" :key="item.name">
                    <RouterLink :to="item.href" :class="[isActive(item) ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                      <component :is="item.icon" :class="[isActive(item) ? 'text-amber-700' : 'text-gray-400 group-hover:text-amber-700', 'size-6 shrink-0']" aria-hidden="true" />
                      {{ item.name }}
                    </RouterLink>
                  </li>
                </ul>
              </li>
              <li>
                <div v-if="voteStore.voteExists">
                  <div class="text-xs/6 font-semibold text-gray-400">{{ vote?.title}}</div>
                  <ul role="list" class="-mx-2 mt-2 space-y-1">
                    <li v-for="category in categories" :key="category.name">
                      <RouterLink :to="category.href" :class="[isActive(category) ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                        <span :class="[isActive(category) ? 'border-amber-700 text-amber-700' : 'border-gray-200 text-gray-400 group-hover:border-amber-700 group-hover:text-amber-700', 'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium']">{{ category.initial }}</span>
                        <span class="truncate">{{ category.name }}</span>
                      </RouterLink>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <div class="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden">
    <button type="button" class="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden" @click="sidebarOpen = true">
      <span class="sr-only">Open sidebar</span>
      <Bars3Icon class="size-6" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  Bars3Icon,
  HomeIcon,
  XMarkIcon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'
import logoImg from '@/assets/banana.png'
import { useVoteStore } from '@/stores/vote';

const voteStore = useVoteStore();
const vote = computed(() => voteStore.vote);

const sidebarOpen = ref(false)
const route = useRoute()
const currentPath = computed(() => route.path)

// 監聽 route.params.uuid 變化並取得 vote 資料
watch(() => route.params.uuid, async (newUuid) => {
  if (newUuid) {
    try {
      await voteStore.fetchVoteByUuid(newUuid);
    } catch (error) {
      console.error('Failed to fetch vote:', error);
    }
  }
}, { immediate: true });

// 初次載入時也檢查
onMounted(() => {
  if (!voteStore.voteExists && route.params.uuid) {
    voteStore.fetchVoteByUuid(route.params.uuid);
  }
});

const isActive = (item) => {
  if (route.path.startsWith('/manage/vote/upsert')) {
    return item.href.startsWith('/manage/vote/upsert')
  }
  if (route.path.startsWith('/manage/question')) {
    return item.href.startsWith('/manage/question')
  }
  if (route.path.startsWith('/manage/candidate')) {
    return item.href.startsWith('/manage/candidate')
  }

  return route.path === item.href
}

const navigation = [
  { name: 'Dashboard', href: '/manage/dashboard', icon: HomeIcon },
  { name: 'Votes', href: '/manage/vote', icon: ListBulletIcon },
]

const categories = computed(() => [
  { name: 'Edit', href: `/manage/vote/upsert/${voteStore.vote?.uuid}`, initial: 'E' },
  { name: 'Question', href: `/manage/question/${voteStore.vote?.uuid}`, initial: 'Q' },
  { name: 'Candidate', href: `/manage/candidate/${voteStore.vote?.uuid}`, initial: 'C' },
  { name: 'Password', href: `/manage/password/${voteStore.vote?.uuid}`, initial: 'P' },
  { name: 'Ballot', href: '#', initial: 'B' },
])

</script>