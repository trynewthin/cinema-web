<template>
  <div class="recharge-form">
    <VaForm ref="form" :model="formData" :rules="rules">
      <VaFormItem label="卡号" disabled>
        <VaInput v-model="formData.cardId" disabled />
      </VaFormItem>
      <VaFormItem label="充值金额" prop="value">
        <VaInput v-model="formData.value" type="number" placeholder="请输入充值金额" />
      </VaFormItem>
    </VaForm>
    <div class="flex justify-end gap-2 mt-4">
      <VaButton @click="$emit('close')">取消</VaButton>
      <VaButton color="primary" @click="handleSubmit">确定</VaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Card } from '../types'

const props = defineProps<{
  card: Card | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { cardId: string; value: number }): void
}>()

const formData = ref({
  cardId: '',
  value: '',
})

const rules = {
  value: [
    { required: true, message: '请输入充值金额' },
    { type: 'number', min: 1, message: '充值金额必须大于0' },
  ],
}

watch(
  () => props.card,
  (newCard) => {
    if (newCard) {
      formData.value.cardId = newCard.cardId
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  const value = Number(formData.value.value)
  if (isNaN(value) || value <= 0) {
    notify({
      message: '请输入有效的充值金额',
      color: 'danger',
    })
    return
  }
  emit('submit', {
    cardId: formData.value.cardId,
    value: value,
  })
}
</script>
