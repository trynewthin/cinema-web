<template>
  <div class="birthday-care-panel">
    <!-- 生日提醒卡片 -->
    <VaCard class="mb-4">
      <VaCardContent class="p-0">
        <div class="today-birthday-panel">
          <div class="panel-header">
            <VaIcon name="celebration" color="warning" size="large" />
            <span class="text-xl font-bold">今日生日会员</span>
          </div>
          <div class="panel-content">
            <div v-if="todayBirthdays.length" class="birthday-list bg-primary-lighten p-4 rounded-lg">
              <div v-for="member in todayBirthdays" :key="member.memberId" class="birthday-item">
                <VaIcon name="cake" color="warning" />
                <span class="birthday-name text-lg">{{ member.name }}</span>
                <VaBadge color="success">生日快乐！</VaBadge>
              </div>
            </div>
            <div v-else class="text-center text-gray-500">今天暂无会员过生日</div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 生日查询和结果面板 -->
    <VaCard>
      <VaCardContent class="p-0">
        <div class="birthday-query-panel">
          <div class="panel-header">
            <VaIcon name="search" color="primary" size="large" />
            <span class="text-xl font-bold">生日查询</span>
          </div>
          <div class="panel-content">
            <!-- 查询工具栏 -->
            <div class="flex flex-wrap items-center mb-6">
              <div class="flex gap-4 items-center">
                <VaButtonGroup>
                  <VaButton
                    :color="queryMode === 'next7days' ? 'primary' : 'secondary'"
                    class="text-base"
                    @click="handleModeChange('next7days')"
                  >
                    未来7天
                  </VaButton>
                  <VaButton
                    :color="queryMode === 'next30days' ? 'primary' : 'secondary'"
                    class="text-base"
                    @click="handleModeChange('next30days')"
                  >
                    未来一个月
                  </VaButton>
                  <VaButton
                    :color="queryMode === 'specific' ? 'primary' : 'secondary'"
                    class="text-base"
                    @click="showDatePicker = true"
                  >
                    指定日期
                  </VaButton>
                </VaButtonGroup>
              </div>
            </div>

            <!-- 查询结果 -->
            <div class="query-results">
              <div v-if="loading" class="text-center py-8">
                <VaProgressCircle indeterminate />
                <div class="mt-2 text-gray-600">正在加载会员数据...</div>
              </div>

              <div v-else-if="!upcomingBirthdays.length" class="text-center py-8">
                <VaIcon name="event_busy" size="large" color="gray" />
                <div class="mt-2 text-gray-600">暂无符合条件的生日会员</div>
              </div>

              <div v-else>
                <VaDataTable :items="upcomingBirthdays" :columns="columns" striped hoverable>
                  <template #cell(daysUntilBirthday)="{ value }">
                    <VaBadge :color="getBadgeColor(value)">
                      {{ value === 0 ? '今天' : `${value}天后` }}
                    </VaBadge>
                  </template>

                  <template #cell(birthday)="{ value }">
                    {{ formatDate(value) }}
                  </template>
                </VaDataTable>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 日期选择弹窗 -->
    <VaModal v-model="showDatePicker" size="small" title="选择日期" :hide-default-actions="true">
      <div class="p-4">
        <VaDatePicker v-model="selectedDate" class="w-full" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton @click="showDatePicker = false"> 取消 </VaButton>
          <VaButton color="primary" @click="handleDateSelect"> 确定 </VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import { useMembers } from '../../members/composables/useMembers'
import type { Member } from '../../members/types'
import { useRouter } from 'vue-router'

// 状态管理
const { members, isLoading: loading, filters, pagination, ...membersApi } = useMembers()
const router = useRouter()

// 检查登录状态
onBeforeMount(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (!isLoggedIn) {
    router.push('/admin/login')
  }
})

// 设置较大的页面大小以获取所有数据
pagination.value = {
  page: 1,
  perPage: 1000,
  total: 0,
}

const queryMode = ref<'next7days' | 'next30days' | 'specific'>('next7days')
const selectedDate = ref(new Date())
const showDatePicker = ref(false)

// 表格列定义
const columns = [
  { key: 'name', title: '会员姓名' },
  { key: 'birthday', title: '生日' },
  { key: 'daysUntilBirthday', title: '距离生日', sortable: true },
]

// 计算今天生日的会员
const todayBirthdays = computed(() => {
  if (!members.value?.length) return []
  return members.value.filter((member) => {
    const birthday = new Date(member.birthday)
    const today = new Date()
    return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()
  })
})

// 计算即将过生日的会员
const upcomingBirthdays = computed(() => {
  if (!members.value?.length) return []
  return members.value
    .map((member) => {
      const birthday = new Date(member.birthday)
      const today = new Date()
      // 获取今年的生日日期
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
      // 获取明年的生日日期
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate())

      // 计算到今年生日的天数
      const daysUntilThisYear = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // 计算到明年生日的天数
      const daysUntilNextYear = Math.ceil((nextYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // 如果今年的生日已过，使用明年的天数；否则使用今年的天数
      const daysUntil = daysUntilThisYear < 0 ? daysUntilNextYear : daysUntilThisYear

      return {
        ...member,
        birthdayDate: `${birthday.getMonth() + 1}月${birthday.getDate()}日`,
        daysUntilBirthday: daysUntil,
      }
    })
    .filter((member) => {
      if (queryMode.value === 'next7days' || queryMode.value === 'next30days') {
        const maxDays = queryMode.value === 'next7days' ? 7 : 30
        // 只显示未来的天数
        return member.daysUntilBirthday >= 0 && member.daysUntilBirthday <= maxDays
      } else {
        const targetDate = new Date(selectedDate.value)
        return member.birthdayDate === `${targetDate.getMonth() + 1}月${targetDate.getDate()}日`
      }
    })
    .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
})

// 获取徽章颜色
const getBadgeColor = (days: number) => {
  if (days === 0) return 'success'
  if (days <= 3) return 'warning'
  return 'info'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 处理日期选择
const handleDateSelect = () => {
  queryMode.value = 'specific'
  showDatePicker.value = false
  handleSearch()
}

// 处理模式切换
const handleModeChange = (mode: 'next7days' | 'next30days' | 'specific') => {
  queryMode.value = mode
  handleSearch()
}

// 搜索处理
const handleSearch = async () => {
  // 重置其他过滤条件
  filters.value = {
    name: '',
    birthdayQuery: '',
  }
  await membersApi.fetch()
}

// 初始加载
onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.birthday-care-panel {
  .today-birthday-panel {
    background: var(--va-background-primary);
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 4px 12px var(--va-shadow);

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      color: var(--va-text-primary);
      background-color: var(--va-background-element);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .panel-content {
      padding: 1rem;
      background-color: var(--va-background-primary);
    }
  }

  .birthday-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .birthday-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--va-background-element);
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .birthday-name {
    font-weight: 500;
  }

  .toolbar {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .birthday-query-panel {
    background: var(--va-background-primary);
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 4px 12px var(--va-shadow);

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-bottom: 1px solid var(--va-background-element);
      background-color: var(--va-background-element);
    }

    .panel-content {
      padding: 1rem;
    }

    .query-results {
      border-top: 1px solid var(--va-background-element);
      margin-top: 1rem;
      padding-top: 1rem;
    }
  }
}
</style>
