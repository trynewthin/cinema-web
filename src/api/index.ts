import request from '../utils/request'
import type { Result, PageResult, DealRecord } from './types'
import { memberAPI } from './member'

export * from './manager'
export * from './movie'
export * from './member'
export * from './card'

// 其他通用 API
export const commonAPI = {
  // 获取统计数据
  getStatisticData: () =>
    request.get<
      Result<{
        memberNum: number
        cardNum: number
        movieNum: number
      }>
    >('/getStatisticData'),

  // 获取交易数据
  getDealData: () => request.get<Result>('/requestDealData'),

  // 获取图表数据
  getChartData: {
    // 充值消费数据
    getRechargeConsumeData: () => request.post<Result>('/getSchart1Data'),
  },
}

// 交易记录相关 API
export const recordAPI = {
  // 查询交易记录
  queryRecord: (query: { memberId: string; pageIndex: number; pageSize: number }) =>
    request.get<Result<PageResult<DealRecord>>>('/queryRecord', {
      params: {
        ...query,
        pageIndex: query.pageIndex.toString(),
        pageSize: query.pageSize.toString(),
      },
    }),

  // 获取所有用户的交易记录汇总
  getAllUserRecords: async () => {
    // 复用现有的会员查询接口获取所有会员
    const { data: members } = await memberAPI.getMemberList({
      pageIndex: 1,
      pageSize: 999,
    })

    // 为每个会员获取交易记录
    const userRecords = await Promise.all(
      members.list.map(async (member) => {
        const { data: records } = await recordAPI.queryRecord({
          memberId: member.memberId,
          pageIndex: 1,
          pageSize: 999,
        })

        return {
          userId: member.memberId,
          userName: member.name,
          recordCount: records.list.length,
          records: records.list,
        }
      }),
    )

    return {
      code: 200,
      message: 'success',
      data: userRecords,
    }
  },
}
