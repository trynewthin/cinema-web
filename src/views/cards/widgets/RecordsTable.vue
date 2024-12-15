<template>
  <div class="records-table">
    <VaDataTable
      :items="records"
      :loading="loading"
      :columns="columns"
      :pagination="pagination"
      @update:pagination="$emit('update:pagination', $event)"
    >
      <template #cell(time)="{ item }">
        {{ new Date(item.time).toLocaleString() }}
      </template>
      <template #cell(value)="{ item }"> {{ item.value }}元 </template>
      <template #cell(type)="{ item }">
        <VaBadge :color="getTypeColor(item.type)">
          {{ item.type }}
        </VaBadge>
      </template>
    </VaDataTable>
  </div>
</template>

<script setup lang="ts">
import type { Record } from '../types'

defineProps<{
  records: Record[]
  loading: boolean
  pagination: {
    page: number
    perPage: number
    total: number
  }
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'update:pagination', pagination: { page: number; perPage: number; total: number }): void
}>()

const columns = [
  {
    key: 'time',
    title: '时间',
  },
  {
    key: 'value',
    title: '金额',
  },
  {
    key: 'type',
    title: '类型',
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case '充值':
      return 'success'
    case '消费':
      return 'warning'
    default:
      return 'info'
  }
}
</script>
