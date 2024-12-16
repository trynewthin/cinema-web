import request from '@/utils/request'
import type { Result, Card, PageResult, PageQuery } from './types'

export const cardAPI = {
  // 获取会员卡列表
  getCardList: (params: PageQuery & { memberId?: string; status?: string }) =>
    request.get<Result<PageResult<Card>>>('/getCardData', { params }),

  // 注册会员卡
  registerCard: (params: { memberId: string }) => request.get<Result>('/registerCard', { params }),

  // 挂失会员卡
  loseCard: (params: { cardId: string }) => request.post<Result>('/loseCard', { params }),

  // 解挂会员卡
  cancelLoseCard: (params: { cardId: string }) => request.post<Result>('/cancelLoseCard', { params }),

  // 补办会员卡
  reissueCard: (params: { cardId: string }) => request.post<Result>('/reissueCard', { params }),

  // 充值会员卡
  rechargeCard: (params: { cardId: string; value: number }) => 
    request.get<Result>('/rechargeCard', { params }),

  // 消费
  consumeCard: (params: {
    cardId: string
    price: string // 消费金额
    integral: string // 获得的积分
  }) => request.post<Result>('/consumeCard', null, { params }),

  // 删除会员卡
  deleteCard: (params: { cardId: string }) => request.post<Result>('/deleteCard', { params }),

  // 积分兑换
  exchangePoints: (params: {
    memberId: string
    integral: string // 要扣除的积分数
  }) => request.post<Result>('/exchangeIntegral', null, { params }),
}

export default cardAPI
