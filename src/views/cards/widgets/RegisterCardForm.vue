<template>
  <form class="p-4" @submit.prevent="handleSubmit">
    <div class="mb-4">
      <label class="block text-sm mb-1">会员ID</label>
      <VaInput v-model="memberId" placeholder="请输入会员ID" :rules="[(v) => !!v || '请输入会员ID']" />
    </div>
    <div class="flex justify-end gap-2">
      <VaButton type="button" color="gray" @click="$emit('close')">取消</VaButton>
      <VaButton type="submit" :loading="isSubmitting">确定</VaButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  card: Card | null
}>()

const emit = defineEmits<{
  (e: 'submit', memberId: string): void
  (e: 'close'): void
}>()

const memberId = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!memberId.value) return

  isSubmitting.value = true
  try {
    await emit('submit', memberId.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>
