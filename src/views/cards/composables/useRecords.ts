import { ref } from 'vue'
import { recordAPI } from '@/api'
import type { Record } from '../types'

export function useRecords() {
  const records = ref<Record[]>([])
  const isLoading = ref(false)
  const pagination = ref({
    page: 1,
    perPage: 10,
    total: 0,
  })

  const fetch = async (cardId: string) => {
    isLoading.value = true
    try {
      const response = await recordAPI.queryRecord({
        pageIndex: pagination.value.page,
        pageSize: pagination.value.perPage,
        cardId: cardId,
      })
      records.value = response.data.list
      pagination.value.total = response.data.pageTotal
    } catch (error) {
      console.error('Failed to fetch records:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    records,
    isLoading,
    pagination,
    fetch,
  }
}
