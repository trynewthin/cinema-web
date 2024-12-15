import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Result } from '../api/types'

// 创建自定义 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    // 例如: 添加 token
    // if (localStorage.getItem('token')) {
    //   config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
    // }
    return config
  },
  (error: any) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    if (response.status === 200) {
      return response.data
    }

    // 否则抛出错误
    return Promise.reject(new Error('请求失败'))
  },
  (error: any) => {
    console.error('Response error:', error)
    let message = '请求失败'

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求错误'
          break
        case 401:
          message = '未授权，请登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址出错'
          break
        case 408:
          message = '请求超时'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 501:
          message = '服务未实现'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        case 505:
          message = 'HTTP版本不受支持'
          break
        default:
          message = `连接出错(${error.response.status})`
      }
    }

    return Promise.reject(new Error(message))
  },
)

// 封装 GET 请求
const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return service.get(url, config)
}

// 封装 POST 请求
const post = <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
  return service.post(url, data, config)
}

// 封装 PUT 请求
const put = <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
  return service.put(url, data, config)
}

// 封装 DELETE 请求
const del = <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
  return service.delete(url, config)
}

// 重写 get 方法的类型
service.get = <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> => {
  return service.request<T, R>({
    method: 'GET',
    url,
    ...config,
  })
}

export default {
  get,
  post,
  put,
  delete: del,
}
