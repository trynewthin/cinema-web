import request from '../utils/request'
import type { Result, Member, PageQuery, PageResult } from './types'

export const memberAPI = {
  // 获取会员列表
  getMemberList: (
    params: PageQuery & {
      name?: string
      birthdayQuery?: '' | '0' | '7' // 空字符串表示无限制，0表示当天，7表示7天内
    },
  ) => request.get<Result<PageResult<Member>>>('/memberData', { params }),

  // 会员注册
  registerMember: (params: Omit<Member, 'memberId'>) => request.get<Result<string>>('/memberRegister', { params }),

  // 删除会员
  deleteMember: (params: { memberId: string }) => request.get<Result>('/delMember', { params }),

  // 修改会员信息
  updateMember: (params: Member) => request.get<Result>('/modifyMember', { params }),

  // 会员登录
  memberLogin: (params: { memberId: string; password: string }) => request.get<Result>('/loginMember', { params }),
}
