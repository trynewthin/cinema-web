<template>
  <VaCard class="statistics-panel">
    <VaCardContent class="p-6">
      <div class="grid grid-cols-3 gap-4">
        <!-- 电影数量 -->
        <div class="stat-item">
          <div class="icon-wrapper bg-primary/10">
            <VaIcon name="movie" color="primary" :size="32" />
          </div>
          <div class="info">
            <div class="value">{{ statistics.movieNum }}</div>
            <div class="label">已售出票数</div>
          </div>
        </div>

        <!-- 会员卡数量 -->
        <div class="stat-item">
          <div class="icon-wrapper bg-success/10">
            <VaIcon name="credit_card" color="success" :size="32" />
          </div>
          <div class="info">
            <div class="value">{{ statistics.cardNum }}</div>
            <div class="label">会员卡数量</div>
          </div>
        </div>

        <!-- 电影票数量 -->
        <div class="stat-item">
          <div class="icon-wrapper bg-warning/10">
            <VaIcon name="local_activity" color="warning" :size="32" />
          </div>
          <div class="info">
            <div class="value">{{ statistics.memberNum }}</div>
            <div class="label">已注册会员</div>
          </div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { commonAPI } from '@/api'
import bus from '@/utils/bus'

interface Statistics {
  movieNum: number
  cardNum: number
  memberNum: number
}

const statistics = ref<Statistics>({
  movieNum: 0,
  cardNum: 0,
  memberNum: 0,
})

// 获取统计数据
const getStatisticData = async () => {
  try {
    const response = await commonAPI.getStatisticData()
    if (response.status === 200 && response.data) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

// 监听数据变化事件
bus.$on('member-change', () => {
  getStatisticData()
})

bus.$on('card-change', () => {
  getStatisticData()
})

bus.$on('movie-change', () => {
  getStatisticData()
})

onMounted(() => {
  getStatisticData()
})
</script>

<style lang="scss" scoped>
.statistics-panel {
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 0.5rem;
    background-color: var(--va-background-element);
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .info {
      flex: 1;

      .value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--va-text-primary);
        line-height: 1.2;
        margin-bottom: 0.25rem;
      }

      .label {
        font-size: 0.875rem;
        color: var(--va-text-secondary);
        font-weight: 500;
      }
    }
  }
}

// 响应式布局
@media (max-width: 640px) {
  .statistics-panel {
    .grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
}
</style>
