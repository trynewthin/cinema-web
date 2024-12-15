<template>
  <VaCard class="admin-info-panel">
    <VaCardContent>
      <div class="flex flex-col items-center">
        <!-- 头像 -->
        <div class="avatar-wrapper mb-4">
          <VaIcon name="account_circle" color="primary" :size="80" />
        </div>

        <!-- 操作员姓名 -->
        <div class="name mb-2">
          <span class="text-xl font-bold">{{ adminInfo.name || '未设置' }}</span>
        </div>

        <!-- 管理员账号 -->
        <div class="account mb-4">
          <span class="text-gray-500">{{ adminInfo.managerId }}</span>
        </div>

        <!-- 分割线 -->
        <div class="divider w-full mb-4"></div>

        <!-- 工作时长 -->
        <div class="duration">
          <div class="text-sm text-gray-500 mb-1">工作时长</div>
          <div class="text-lg font-medium">{{ workDuration }}</div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { managerAPI } from '@/api'

interface AdminInfo {
  managerId: string
  name: string
}

const adminInfo = ref<AdminInfo>({
  managerId: '',
  name: '',
})

const loginTime = ref(localStorage.getItem('loginTime') || new Date().toISOString())
const workDuration = ref('')

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0',
  )} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 计算工作时长
const calculateDuration = () => {
  const start = new Date(loginTime.value)
  const now = new Date()
  const diff = now.getTime() - start.getTime()

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  workDuration.value = `${hours}小时${minutes}分钟`
}

// 定时更新工作时长
let timer: number
const startTimer = () => {
  timer = window.setInterval(calculateDuration, 60000) // 每分钟更新一次
  calculateDuration() // 立即计算一次
}

// 获取管理员信息
const fetchAdminInfo = async () => {
  try {
    const managerId = localStorage.getItem('managerId')
    if (managerId) {
      const response = await managerAPI.getManagerData({ managerId })
      if (response.status === 200 && response.data) {
        adminInfo.value = response.data
      }
    }
  } catch (error) {
    console.error('Failed to fetch admin info:', error)
  }
}

onMounted(() => {
  fetchAdminInfo()
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.admin-info-panel {
  width: 300px;
  margin: 0 auto;

  .avatar-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--va-background-element);
  }

  .name {
    color: var(--va-text-primary);
  }

  .account {
    font-size: 0.875rem;
  }

  .divider {
    height: 1px;
    background-color: var(--va-background-element);
  }

  .duration {
    text-align: center;

    .text-lg {
      color: var(--va-primary);
    }
  }
}

// 响应式布局
@media (max-width: 640px) {
  .admin-info-panel {
    width: 100%;
  }
}
</style>
