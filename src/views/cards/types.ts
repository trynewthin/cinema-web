export interface Card {
  cardId: string
  memberId: string
  balance: number
  integral: number
  lose: number
}

// 后端返回的原始数据类型
export interface RawCard {
  cardid?: string
  cardId?: string
  memberid?: string
  memberId?: string
  balance: number | string
  integral: number | string
  lose: number | string
}

export interface Record {
  id: number
  cardId: string
  value: number
  time: string
  spendType: number
}

export interface Pagination {
  page: number
  perPage: number
  total: number
}

export interface Filters {
  cardId: string
  memberId: string
}
