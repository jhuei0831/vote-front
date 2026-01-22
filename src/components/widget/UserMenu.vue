<template>
  <Menu as="div" class="relative inline-block">
    <MenuButton class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50">
      {{ user.account }}
      <ChevronDownIcon class="-mr-1 size-5 text-gray-400" aria-hidden="true" />
    </MenuButton>

    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform scale-100" leave-to-class="transform opacity-0 scale-95">
      <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5">
        <div class="py-1">
          <MenuItem 
            v-for="link in links"
            :key="link.href"
            :to="link.href"
            as="a"
            v-slot="{ active }"
          >
            <RouterLink :to="link.href" :class="[active ? 'bg-gray-100 text-gray-900 outline-hidden' : 'text-gray-700', 'block px-4 py-2 text-sm']">
              {{ link.label }}
            </RouterLink>
          </MenuItem>
          <MenuItem>
            <button 
              @click="authStore.logout()" 
              class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Logout
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup>
  import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
  import { ChevronDownIcon } from '@heroicons/vue/20/solid'
  import { useAuthStore } from '@/stores/auth';  

  const authStore = useAuthStore()
  defineProps(['user'])

  const links = [
    { href: '/manage/dashboard', label: 'Manage' },
  ]
</script>