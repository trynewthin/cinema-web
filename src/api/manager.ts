import request from '../utils/request'
import type { Result, Manager } from './types'

export const managerAPI = {
  // 管理员登录
  managerLogin: (params: { managerId: string; password: string }) =>
    request.get<Result<string>>('/managerLogin', { params }).then((res) => {
      // 即使状态码是500，也要返回结果让调用方处理
      return res
    }),

  // 获取管理员信息
  getManagerData: (params: { managerId: string }) => request.get<Result<Manager>>('/getManagerData', { params }),
}
