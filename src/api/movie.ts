import request from '../utils/request'
import type { Result, Movie, PageQuery, PageResult } from './types'

export const movieAPI = {
  // 获取电影列表
  getMovieList: (params: PageQuery) => 
    request.get<Result<PageResult<Movie>>>('/getMovie', { params }),

  // 添加电影
  insertMovie: (params: {
    name: string
    price: number
    time: string
    integral: number
  }) => request.post<Result>('/insertMovie', null, { params }),

  // 修改电影
  modifyMovie: (params: {
    movieId: string
    name: string
    price: number
    time: string
    integral: number
  }) => request.get<Result>('/modifyMovie', { params }),

  // 删除电影
  deleteMovie: (params: { movieId: string }) => 
    request.get<Result>('/delMovie', { params }),
}

export default movieAPI
