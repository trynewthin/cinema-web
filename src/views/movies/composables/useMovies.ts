import { ref, watch, computed } from 'vue'
import { movieAPI } from '../../../api'
import type { Movie, MovieApiResponse, PageResult } from '../types'

export const useMovies = () => {
  const isLoading = ref(false)
  const allMovies = ref<Movie[]>([])
  const filters = ref({ name: '' })
  const pagination = ref({ page: 1, perPage: 10, total: 0 })

  const movies = computed(() => {
    let filtered = [...allMovies.value]
    
    if (filters.value.name) {
      const searchTerm = filters.value.name.toLowerCase()
      filtered = filtered.filter(movie => 
        movie.name.toLowerCase().includes(searchTerm)
      )
    }

    pagination.value.total = filtered.length

    const start = (pagination.value.page - 1) * pagination.value.perPage
    const end = start + pagination.value.perPage
    
    return filtered.slice(start, end)
  })

  const fetch = async () => {
    isLoading.value = true
    try {
      const result = await movieAPI.getMovieList({
        pageIndex: 1,
        pageSize: 1000,
      })

      if (result.data) {
        allMovies.value = (result.data.list || [])
          .map((item: MovieApiResponse) => ({
            movieId: item.movieId,
            name: item.name,
            ticketsSold: Number(item.integral || 0),
            releaseDate: item.time || '',
            price: Number(item.price || 29.9),
          }))
      } else {
        allMovies.value = []
        console.error('API request failed:', result)
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error)
      allMovies.value = []
    } finally {
      isLoading.value = false
    }
  }

  watch(filters, () => {
    pagination.value.page = 1
  }, { deep: true })

  fetch()

  return {
    isLoading,
    filters,
    pagination,
    movies,
    fetch,

    async add(movie: Movie) {
      isLoading.value = true
      try {
        await movieAPI.insertMovie({
          name: movie.name,
          price: Number(movie.price),
          time: movie.releaseDate,
          integral: Number(movie.ticketsSold || 0),
        })
        await fetch()
      } finally {
        isLoading.value = false
      }
    },

    async update(movie: Movie) {
      isLoading.value = true
      try {
        await movieAPI.modifyMovie({
          movieId: movie.movieId,
          name: movie.name,
          time: movie.releaseDate,
          price: Number(movie.price),
          integral: Number(movie.ticketsSold || 0),
        })
        await fetch()
      } finally {
        isLoading.value = false
      }
    },

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
