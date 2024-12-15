// 通用响应类型
export interface Result<T = any> {
  code: number
  message: string
  data?: T
}

// 分页参数
export interface PageQuery {
  pageIndex: number
  pageSize: number
}

// 分页响应
export interface PageResult<T> {
  list: T[]
  pageTotal: number
}

// 管理员类型
export interface Manager {
  managerId: string
  name: string
  password: string
}

// 电影类型
export interface Movie {
  movieId: string
  name: string
  price: number
  time: string // ISO 格式的时间字符串
}

// 会员类型
export interface Member {
  memberId: string
  name: string
  password: string
  birthday?: string
}

// 会员卡类型
export interface Card {
  cardId: string
  memberId: string
  balance: number
  integral: number
  status: 'normal' | 'lost' | 'cancelled'
}

// 交易记录类型
export interface DealRecord {
  recordId: string
  cardId: string
  amount: number
  type: 'recharge' | 'consume'
  time: string
}

// 用户交易记录汇总
export interface UserRecordSummary {
  userId: string
  userName: string
  recordCount: number
  records: DealRecord[]
}
