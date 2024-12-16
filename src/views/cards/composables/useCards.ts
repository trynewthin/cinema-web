import { ref } from 'vue'
import { cardAPI } from '@/api'
import { memberAPI } from '@/api'
import type { Card } from '../types'

export function useCards() {
  const cards = ref<Card[]>([])
  const isLoading = ref(false)
  const filters = ref({
    cardId: '',
    memberId: '',
  })
  const pagination = ref({
    page: 1,
    perPage: 10,
    total: 0,
  })

  const transformCard = (rawCard: any): Card => {
    const card = {
      cardId: rawCard.cardId || rawCard.cardid || '',
      memberId: rawCard.memberId || rawCard.memberid || '',
      balance:
        typeof rawCard.balance === 'number'
          ? rawCard.balance
          : typeof rawCard.balance === 'string'
            ? parseInt(rawCard.balance)
            : 0,
      integral:
        typeof rawCard.integral === 'number'
          ? rawCard.integral
          : typeof rawCard.integral === 'string'
            ? parseInt(rawCard.integral)
            : 0,
      lose:
        typeof rawCard.lose === 'number' ? rawCard.lose : typeof rawCard.lose === 'string' ? parseInt(rawCard.lose) : 0,
    }
    return card
  }

  const fetch = async () => {
    isLoading.value = true
    try {
      const memberResponse = await memberAPI.getMemberList({
        pageIndex: 1,
        pageSize: 1000,
        name: '',
        birthdayQuery: '',
      })

      const allCards: Card[] = []

      const cardPromises = memberResponse.data.list.map((member) =>
        cardAPI
          .getCardList({
            pageIndex: 1,
            pageSize: 1000,
            memberId: member.memberId,
          })
          .then((cardResponse) => {
            if (cardResponse.data.list.length > 0) {
              const transformedCards = cardResponse.data.list.map(transformCard)
              allCards.push(...transformedCards)
            }
          })
          .catch((error) => {
            console.error(`获取会员 ${member.memberId} 的卡片信息失败:`, error)
          }),
      )

      await Promise.all(cardPromises)

      // 按会员ID分组排序
      allCards.sort((a, b) => {
        if (a.memberId === b.memberId) {
          return a.cardId.localeCompare(b.cardId)
        }
        return a.memberId.localeCompare(b.memberId)
      })

      // 直接显示所有卡片，不进行分页
      cards.value = allCards
      pagination.value.total = allCards.length
      pagination.value.perPage = allCards.length
      pagination.value.page = 1
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const searchCard = async (cardId: string) => {
    isLoading.value = true
    try {
      const response = await cardAPI.getCardByCardId(cardId)
      if (response.data) {
        cards.value = [transformCard(response.data)]
        pagination.value.total = 1
      }
    } catch (error) {
      console.error('Failed to search card:', error)
    } finally {
      isLoading.value = false
    }
  }

  const searchByMemberId = async (memberId: string) => {
    isLoading.value = true
    try {
      const response = await cardAPI.getCardList({
        pageIndex: 1,
        pageSize: 1000,
        memberId,
      })
      cards.value = response.data.list.map(transformCard)
      pagination.value.total = response.data.list.length
    } catch (error) {
      console.error('Failed to search cards by member ID:', error)
    } finally {
      isLoading.value = false
    }
  }

  const register = async (memberId: string) => {
    await cardAPI.registerCard({ memberId })
  }

  const recharge = async (params: { cardId: string; value: string }) => {
    try {
      if (!params.cardId || !params.value) {
        throw new Error('无效的充值参数')
      }

      const value = parseInt(params.value, 10)
      if (isNaN(value) || value <= 0) {
        throw new Error('充值金额必须大于0')
      }

      const response = await cardAPI.rechargeCard({
        cardId: params.cardId.trim(),
        value: value
      })

      // 充值成功后立即更新本地数据
      const result = await fetch()
      
      // 确保返回成功结果
      return {
        code: 200,
        message: '充值成功',
        data: result
      }
    } catch (error: any) {
      console.error('充值失败:', error)
      throw new Error(error.response?.data?.message || error.message || '充值失败')
    }
  }

  const lose = async (cardId: string) => {
    try {
      const response = await cardAPI.loseCard({ cardId })
      
      // 先更新数据
      await fetch()
      
      // 返回成功结果
      return {
        code: 200,
        message: '挂失成功',
        data: response.data
      }
    } catch (error: any) {
      console.error('挂失失败:', error)
      throw new Error('挂失失败')
    }
  }

  const cancelLose = async (cardId: string) => {
    try {
      const response = await cardAPI.cancelCard({ cardId })
      
      // 先更新数据
      await fetch()
      
      // 返回成功结果
      return {
        code: 200,
        message: '解挂成功',
        data: response.data
      }
    } catch (error: any) {
      console.error('解挂失败:', error)
      throw new Error('解挂失败')
    }
  }

  const reissue = async (cardId: string) => {
    await cardAPI.reissueCard({ cardId })
  }

  const deleteCard = async (cardId: string) => {
    await cardAPI.deleteCard({ cardId })
  }

  return {
    cards,
    isLoading,
    filters,
    pagination,
    fetch,
    register,
    recharge,
    lose,
    cancelLose,
    reissue,
    deleteCard,
    searchCard,
    searchByMemberId,
  }
}
