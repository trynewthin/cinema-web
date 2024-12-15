<template>
  <VaCard class="upcoming-movies" style="height: 300px; width: 100%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)">
    <VaCardContent class="p-0">
      <div class="panel-header">
        <div class="flex items-center gap-2">
          <VaIcon name="upcoming" color="primary" size="large" />
          <span class="text-xl font-bold">近期上映</span>
        </div>
        <VaButton
          preset="plain"
          icon="autorenew"
          color="primary"
          class="refresh-btn"
          :loading="loading"
          @click="refreshMovies"
        />
      </div>

      <div class="panel-content">
        <div v-if="loading" class="text-center py-8">
          <VaProgressCircle indeterminate />
          <div class="mt-2 text-gray-600">加载中...</div>
        </div>

        <div v-else-if="!displayMovies.length" class="text-center py-8">
          <VaIcon name="movie_filter" size="large" color="gray" />
          <div class="mt-2 text-gray-600">暂无近期上映电影</div>
        </div>

        <div v-else class="movie-grid">
          <div v-for="movie in displayMovies" :key="movie.movieId" class="movie-item">
            <div class="flex items-center gap-3">
              <div class="icon-wrapper">
                <VaIcon name="movie" color="primary" />
              </div>
              <div class="flex-1">
                <div class="movie-name">{{ movie.name }}</div>
                <div class="movie-time">{{ formatDate(movie.time) }}</div>
              </div>
              <div class="movie-price">¥{{ movie.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { movieAPI } from '@/api'
import type { Movie } from '@/api/types'

const loading = ref(false)
const allMovies = ref<Movie[]>([])
const displayCount = 4 // 显示的电影数量

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

// 随机获取指定数量的电影
const getRandomMovies = (movies: Movie[], count: number) => {
  const shuffled = [...movies].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 计算要显示的电影
const displayMovies = computed(() => {
  return getRandomMovies(allMovies.value, displayCount)
})

// 获取电影数据
const fetchMovies = async () => {
  loading.value = true
  try {
    const response = await movieAPI.getMovieList({
      pageIndex: 1,
      pageSize: 1000, // 获取所有电影
    })
    if (response.status === 200 && response.data) {
      allMovies.value = response.data.list
    }
  } catch (error) {
    console.error('Failed to fetch movies:', error)
  } finally {
    loading.value = false
  }
}

// 刷新电影列表
const refreshMovies = () => {
  // 重新获取数据以确保数据最新
  fetchMovies()
}

onMounted(() => {
  fetchMovies()
})
</script>

<style lang="scss" scoped>
.upcoming-movies {
  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid var(--va-background-element);
    background-color: var(--va-background-element);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-content {
    padding: 1rem;
  }

  .movie-grid {
    display: grid;
    column-gap: 0.75rem;
    row-gap: 0.75rem;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(2, 1fr);
    height: calc(300px - 4rem);
    overflow-y: auto;
    padding: 0.25rem;
  }

  .movie-item {
    padding: 0.75rem;
    background-color: var(--va-background-element);
    border-radius: 0.5rem;
    transition: transform 0.2s ease;
    height: 65px;
    display: flex;
    align-items: center;

    &:hover {
      transform: translateY(-2px);
    }

    .icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 0.5rem;
      background-color: var(--va-primary-opacity);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .movie-name {
      font-weight: 500;
      color: var(--va-text-primary);
      font-size: 0.95rem;
    }

    .movie-time {
      font-size: 0.8rem;
      color: var(--va-text-secondary);
    }

    .movie-price {
      font-weight: bold;
      color: var(--va-primary);
    }
  }

  .refresh-btn {
    transition: transform 0.3s ease;

    &:hover {
      transform: rotate(180deg);
    }
  }
}
</style>
