<template>
  <Dialog 
    v-model:visible="visible" 
    :style="{ width: '600px' }" 
    header="Create New Password" 
    :modal="true"
    @update:visible="handleClose"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit" class="flex flex-col gap-4 w-full">
      <span class="text-surface-500 dark:text-surface-400 block mb-4">Enter password generation settings.</span>
      
      <div class="mb-4">
        <div class="flex items-center gap-4 mb-1">
          <label for="number" class="font-semibold w-24">Number</label>
          <InputNumber id="number" name="number" class="flex-auto" fluid :min="1" :max="1000" />
        </div>
        <Message v-if="$form.number?.invalid" severity="error" size="small" variant="simple" class="ml-28">
          {{ $form.number.error?.message }}
        </Message>
      </div>

      <div class="mb-4">
        <div class="flex items-center gap-4 mb-1">
          <label for="length" class="font-semibold w-24">Length</label>
          <InputNumber id="length" name="length" class="flex-auto" fluid :min="4" :max="32" />
        </div>
        <Message v-if="$form.length?.invalid" severity="error" size="small" variant="simple" class="ml-28">
          {{ $form.length.error?.message }}
        </Message>
      </div>

      <div class="mb-4">
        <div class="flex items-center gap-4 mb-1">
          <label for="format" class="font-semibold w-24">Format</label>
          <Select 
            id="format" 
            name="format" 
            :options="formatOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Select a format"
            class="flex-auto" 
            fluid 
          />
        </div>
        <Message v-if="$form.format?.invalid" severity="error" size="small" variant="simple" class="ml-28">
          {{ $form.format.error?.message }}
        </Message>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <Button 
          type="button" 
          label="Cancel" 
          severity="secondary" 
          variant="text"
          @click="handleClose" 
        />
        <Button 
          type="submit" 
          :loading="submitting" 
          label="Create" 
          severity="success" 
          icon="pi pi-save" 
        />
      </div>
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import { Form, type FormResolverOptions } from '@primevue/forms'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Message from 'primevue/message'
import { computed } from 'vue'

interface PasswordFormProps {
  visible: boolean
  initialValues: {
    number: number
    length: number
    format: string
  }
  submitting?: boolean
  resolver: (e: FormResolverOptions) => Record<string, any> | Promise<Record<string, any>> | undefined
}

const props = defineProps<PasswordFormProps>()

const emit = defineEmits(['submit', 'update:visible'])

const formatOptions = [
  { label: 'Integer Only', value: 'int' },
  { label: 'English Only', value: 'en' },
  { label: 'Mix (Letters + Numbers)', value: 'mix' },
  { label: 'Mix Exclude Similar (Excl. 0,O,l,1)', value: 'mixExcl' },
  { label: 'Mix Lowercase', value: 'mixLower' },
  { label: 'Mix Uppercase', value: 'mixUpper' }
]

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

function onSubmit({ valid, values }: { valid: boolean; values: any }) {
  emit('submit', { valid, values })
}

function handleClose() {
  emit('update:visible', false)
}
</script>
