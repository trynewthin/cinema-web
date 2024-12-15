import request from '../utils/request'
import type { Result, Movie, PageQuery, PageResult } from './types'

export const movieAPI = {
  // 获取电影列表
  getMovieList: (params: PageQuery) => request.get<Result<PageResult<Movie>>>('/getMovie', { params }),

  // 修改电影信息
  modifyMovie: (params: Movie) => request.get<Result>('/modifyMovie', { params }),
}

export default movieAPI
