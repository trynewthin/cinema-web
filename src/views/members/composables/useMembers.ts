import { ref, watch } from 'vue'
import { memberAPI } from '../../../api'
import type { Member } from '../types'

export const useMembers = () => {
  const isLoading = ref(false)
  const members = ref<Member[]>([])
  const filters = ref({ name: '', birthdayQuery: '' })
  const pagination = ref({ page: 1, perPage: 10, total: 0 })

  const fetch = async () => {
    isLoading.value = true
    try {
      const result = await memberAPI.getMemberList({
        pageIndex: pagination.value.page,
        pageSize: pagination.value.perPage,
        name: filters.value.name || undefined,
        birthdayQuery: filters.value.birthdayQuery || undefined,
      })

      if (result.status === 200 && result.data) {
        const pageSize = pagination.value.perPage
        members.value = (result.data.list || []).slice(0, pageSize)
        pagination.value.total = result.data.pageTotal || 0

        const maxPage = Math.ceil(pagination.value.total / pageSize)
        if (maxPage > 0 && pagination.value.page > maxPage) {
          pagination.value.page = maxPage
        }

        if (pagination.value.page < maxPage && members.value.length < pageSize) {
          console.warn('Data length inconsistent, retrying...')
          await fetch()
        }
      } else {
        members.value = []
        pagination.value.total = 0
        console.error('API request failed:', result)
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
      members.value = []
      pagination.value.total = 0
    } finally {
      isLoading.value = false
    }
  }

  watch([pagination, filters], fetch, { deep: true })

  fetch()

  return {
    isLoading,
    filters,
    pagination,
    members,
    fetch,

    async add(member: Member) {
      isLoading.value = true
      try {
        await memberAPI.registerMember(member)
        await fetch()
      } finally {
        isLoading.value = false
      }
    },

    async update(member: Member) {
      isLoading.value = true
      try {
        await memberAPI.updateMember(member)
        await fetch()
      } finally {
        isLoading.value = false
      }
    },

    async remove(member: Member) {
      isLoading.value = true
      try {
        await memberAPI.deleteMember({ memberId: member.memberId })
        await fetch()
      } finally {
        isLoading.value = false
      }
    },
  }
}
