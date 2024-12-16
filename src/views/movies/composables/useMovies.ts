import { ref, watch } from 'vue'
import { movieAPI } from '../../../api'
import type { Movie } from '../types'

export const useMovies = () => {
  const isLoading = ref(false)
  const movies = ref<Movie[]>([])
  const filters = ref({ name: '' })
  const pagination = ref({ page: 1, perPage: 10, total: 0 })

  const fetch = async () => {
    isLoading.value = true
    try {
      const result = await movieAPI.getMovieList({
        pageIndex: pagination.value.page,
        pageSize: pagination.value.perPage,
        name: filters.value.name || undefined,
      })

      if (result.status === 200 && result.data) {
        const pageSize = pagination.value.perPage
        movies.value = (result.data.list || [])
          .map((item) => ({
            movieId: item.movieId,
            name: item.name,
            ticketsSold: Number(item.integral || 0),
            releaseDate: item.time || '',
            price: Number(item.price || 29.9),
          }))
          .slice(0, pageSize)

        pagination.value.total = result.data.pageTotal || 0

        const maxPage = Math.ceil(pagination.value.total / pageSize)
        if (maxPage > 0 && pagination.value.page > maxPage) {
          pagination.value.page = maxPage
        }
      } else {
        movies.value = []
        pagination.value.total = 0
        console.error('API request failed:', result)
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error)
      movies.value = []
      pagination.value.total = 0
    } finally {
      isLoading.value = false
    }
  }

  // 监听过滤器和分页变化
  watch([pagination, filters], fetch, { deep: true })

  // 初始加载
  fetch()

  return {
    isLoading,
    filters,
    pagination,
    movies,
    fetch,

    // 添加电影
    async add(movie: Movie) {
      isLoading.value = true
      try {
        await movieAPI.insertMovie({
          name: movie.name,
          price: Number(movie.price),
          time: movie.time,
          integral: Number(movie.ticketsSold || 0),
        })
        await fetch()
      } finally {
        isLoading.value = false
      }
    },

    // 更新电影
    async update(movie: Movie) {
      isLoading.value = true
      try {
        await movieAPI.modifyMovie({
          movieId: movie.movieId,
          name: movie.name,
          time: movie.time,
          price: Number(movie.price),
          integral: Number(movie.ticketsSold || 0),
        })
        await fetch()
      } finally {
        isLoading.value = false
      }
    },

    // 删除电影
    async remove(movie: Movie) {
      isLoading.value = true
      try {
        await movieAPI.deleteMovie({
          movieId: movie.movieId,
        })
        await fetch()
      } finally {
        isLoading.value = false
      }
    },
  }
}
