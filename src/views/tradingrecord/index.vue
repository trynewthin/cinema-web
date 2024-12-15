<template>
  <div class="trading-record">
    <h1 class="page-title text-2xl font-bold mb-6">交易记录</h1>

    <!-- 工具栏 -->
    <div class="toolbar mb-4 flex flex-wrap items-center justify-between">
      <div class="flex gap-4 items-center">
        <!-- 搜索框 -->
        <div class="flex gap-2">
          <VaInput
            v-model="searchQuery"
            placeholder="输入用户名搜索"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
          <VaButton size="medium" class="search-btn" @click="handleSearch"> 搜索 </VaButton>
        </div>
      </div>
    </div>

    <!-- 排序工具栏 -->
    <div class="sort-toolbar mb-4">
      <div class="btn-group">
        <VaButton
          size="medium"
          class="sort-btn"
          :color="sortType === 'count' ? 'primary' : 'secondary'"
          @click="handleSortTypeChange('count')"
        >
          按交易数排序
        </VaButton>
        <VaButton
          size="medium"
          class="sort-btn"
          :color="sortType === 'name' ? 'primary' : 'secondary'"
          @click="handleSortTypeChange('name')"
        >
          按用户名排序
        </VaButton>
      </div>
    </div>

    <!-- 用户面板部分 -->
    <VaCard>
      <VaCardContent>
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-8">
          <VaProgressCircle indeterminate />
          <div class="mt-2 text-gray-600">正在加载交易记录...</div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!filteredUsers.length" class="text-center py-8">
          <VaIcon name="receipt_long" size="large" color="gray" />
          <div class="mt-2 text-gray-600">暂无交易记录</div>
        </div>

        <!-- 用户面板列表 -->
        <div v-else class="user-panels">
          <VaAccordion>
            <div v-for="user in filteredUsers" :key="user.userId" class="user-panel">
              <VaCollapse
                :header="user.userName"
                :active="activeNames.includes(user.userId)"
                @click="togglePanel(user.userId)"
              >
                <template #header-append>
                  <VaBadge :text="user.recordCount + '笔交易'" color="info" />
                </template>

                <VaDataTable :items="user.records" :columns="columns" striped hoverable>
                  <template #cell(spendType)="{ row }">
                    <VaBadge
                      :text="row.rowData.spendType === 0 ? '人民币' : '积分'"
                      :color="row.rowData.spendType === 0 ? 'success' : 'danger'"
                    />
                  </template>

                  <template #cell(value)="{ row }">
                    <span :class="{ positive: row.rowData.value > 0, negative: row.rowData.value < 0 }">
                      {{ formatValue(row.rowData.value, row.rowData.spendType) }}
                    </span>
                  </template>
                </VaDataTable>
              </VaCollapse>
            </div>
          </VaAccordion>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { recordAPI } from '@/api'
import type { UserRecordSummary } from '@/api/types'
import { useGlobalConfig } from 'vuestic-ui'

const { getGlobalConfig } = useGlobalConfig()
const { notify } = getGlobalConfig()

const users = ref<UserRecordSummary[]>([])
const searchQuery = ref('')
const sortType = ref<'name' | 'count'>('count')
const activeNames = ref<string[]>([])
const loading = ref(false)

const sortOptions = [
  { value: 'name', text: '按用户名排序' },
  { value: 'count', text: '按交易数量排序' },
]

const columns = [
  { key: 'time', title: '交易时间' },
  { key: 'spendType', title: '交易类型' },
  { key: 'value', title: '金额/积分' },
]

const getSpendTypeInfo = (type: number) => ({
  text: type === 0 ? '人民币' : '积分',
  color: type === 0 ? 'success' : 'danger'
})

const formatValue = (value: number, spendType: number) => {
  const prefix = value > 0 ? '+' : ''
  const suffix = spendType === 0 ? ' 元' : ' 积分'
  console.log('格式化交易值:', {
    原始值: value,
    类型: spendType,
    格式化结果: `${prefix}${value}${suffix}`,
    完整数据: {
      value,
      spendType,
      isNumber: typeof value === 'number',
      isString: typeof value === 'string',
    },
  })
  return `${prefix}${value}${suffix}`
}

const filteredUsers = computed(() => {
  return users.value.filter((user) => user.userName.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const fetchAllUserRecords = async () => {
  loading.value = true
  try {
    const { data } = await recordAPI.getAllUserRecords()
    users.value = data
    handleSort()
  } catch (error) {
    notify({
      color: 'danger',
      message: '获取交易记录失败',
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  activeNames.value = filteredUsers.value.map((user) => user.userId)
}

const handleSort = () => {
  users.value.sort((a, b) => {
    if (sortType.value === 'name') {
      return a.userName.localeCompare(b.userName)
    } else {
      return b.recordCount - a.recordCount
    }
  })
}

const handleSortTypeChange = (type: 'name' | 'count') => {
  sortType.value = type
  handleSort()
}

const togglePanel = (userId: string) => {
  const index = activeNames.value.indexOf(userId)
  if (index === -1) {
    activeNames.value.push(userId)
  } else {
    activeNames.value.splice(index, 1)
  }
}

onMounted(() => {
  fetchAllUserRecords()
})
</script>

<style lang="scss" scoped>
.trading-record {
  padding: 1.5rem;

  .positive {
    color: var(--va-success);
  }

  .negative {
    color: var(--va-danger);
  }
}

.page-title {
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: bold;
}

.toolbar {
  background-color: var(--va-background-primary);
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px var(--va-shadow);
}

.btn-group {
  display: flex;
}

.sort-btn {
  border-radius: 0;
  min-width: 120px;
  height: 40px;
  position: relative;
}

.sort-btn:first-child {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  margin-right: -1px;
}

.sort-btn:last-child {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.sort-btn[color='primary'] {
  z-index: 1;
}

.search-input {
  width: 200px;
}

.search-btn {
  border-radius: 0.5rem;
  padding: 0 1.5rem;
  white-space: nowrap;
  height: 40px;
}

.sort-toolbar {
  background-color: var(--va-background-primary);
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px var(--va-shadow);
}

/* 响应式布局 */
@media (max-width: 640px) {
  .toolbar {
    gap: 1rem;
  }

  .search-input {
    width: 160px;
  }
}

.user-panels {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.user-panel {
  background-color: var(--va-background-primary);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 1rem;
  border: 1px solid var(--va-background-border);
  margin: 0.5rem;

  &:hover {
    box-shadow: 0 4px 12px var(--va-shadow);
  }

  .va-collapse {
    background-color: transparent;
    border-radius: 0.5rem;
  }

  .va-data-table {
    margin: 0.5rem;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  }
}

.text-center {
  text-align: center;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.text-gray-600 {
  color: var(--va-gray);
}
</style>
