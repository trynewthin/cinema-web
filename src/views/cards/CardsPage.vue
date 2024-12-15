<template>
  <div class="cards-page">
    <h1 class="page-title text-3xl font-bold mb-6">会员卡管理</h1>

    <!-- 工具栏 -->
    <div class="toolbar mb-4 flex flex-wrap items-center justify-between">
      <!-- 注册按钮 -->
      <VaButton size="large" color="success" class="register-all-btn" @click="showSelectMembersModal = true">
        <VaIcon name="add_card" class="mr-2" />
        为未办卡会员注册会员卡
      </VaButton>

      <div class="flex gap-4 items-center">
        <!-- 搜索框 -->
        <div class="flex gap-2">
          <VaInput
            v-model="searchName"
            placeholder="输入会员姓名搜索"
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
          :color="sortBy === 'name' ? 'primary' : 'secondary'"
          @click="sortBy = 'name'"
        >
          按姓名排序
        </VaButton>
        <VaButton
          size="medium"
          class="sort-btn"
          :color="sortBy === 'cardCount' ? 'primary' : 'secondary'"
          @click="sortBy = 'cardCount'"
        >
          按卡数排序
        </VaButton>
      </div>
    </div>

    <VaCard>
      <VaCardContent>
        <!-- 加载状态 -->
        <div v-if="isLoading" class="text-center py-8">
          <VaProgressCircle indeterminate />
          <div class="mt-2 text-gray-600">正在加载会员卡信息...</div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!memberCards.length" class="text-center py-8">
          <VaIcon name="credit_card_off" size="large" color="gray" />
          <div class="mt-2 text-gray-600">暂无会员卡信息</div>
        </div>

        <!-- 会员卡片列表 -->
        <div v-else class="member-panels">
          <MemberCardPanel
            v-for="(member, index) in memberCards"
            :key="member.memberId"
            :member="member"
            :cards="member.cards"
            :index="index"
            @register="handleRegisterCard"
            @recharge="handleShowRecharge"
            @loseCard="handleLoseCard"
            @cancelLose="handleCancelLose"
            @reissueCard="handleReissueCard"
            @deleteCard="handleDeleteCard"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 充值模态框 -->
    <VaModal
      v-model="showRechargeModal"
      size="small"
      title="会员卡充值"
      :before-close="beforeModalClose"
      :hide-default-actions="true"
    >
      <RechargeForm :card="selectedCard" @close="showRechargeModal = false" @submit="handleRecharge" />
    </VaModal>

    <!-- 选择会员模态框 -->
    <VaModal v-model="showSelectMembersModal" title="选择会员注册会员卡" size="medium" :hide-default-actions="true">
      <div class="select-members-content">
        <div v-if="membersWithoutCards.length === 0" class="text-center py-4">所有会员都已办理会员卡</div>
        <div v-else>
          <!-- 全选框 -->
          <div class="select-all-row">
            <VaButton size="small" class="select-all-btn" @click="toggleSelectAll">
              <VaIcon :name="isAllSelected ? 'check_box' : 'check_box_outline_blank'" class="mr-2" />
              全选
            </VaButton>
          </div>

          <div
            v-for="member in membersWithoutCards"
            :key="member.memberId"
            class="member-item"
            :class="{ selected: selectedMembers.includes(member.memberId) }"
            @click="toggleMemberSelection(member.memberId)"
          >
            <VaIcon
              :name="selectedMembers.includes(member.memberId) ? 'check_box' : 'check_box_outline_blank'"
              class="mr-2"
            />
            {{ member.name }}
            <span class="text-gray-500 text-sm ml-2">(ID: {{ member.memberId }})</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-between items-center w-full">
          <div class="text-sm text-gray-600">已选择 {{ selectedMembers.length }} 名会员</div>
          <div class="flex gap-2">
            <VaButton size="medium" class="modal-btn" @click="showSelectMembersModal = false"> 取消 </VaButton>
            <VaButton
              size="medium"
              class="modal-btn"
              color="primary"
              :disabled="selectedMembers.length === 0"
              @click="handleRegisterForNoCards()"
            >
              注册会员卡
            </VaButton>
          </div>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast, useModal } from 'vuestic-ui'
import { useCards } from './composables/useCards'
import type { Card } from './types'
import { memberAPI } from '../../api'

// 导入组件
import MemberCardPanel from './widgets/MemberCardPanel.vue'
import RechargeForm from './widgets/RechargeForm.vue'

// 使用组合式API
const { cards, isLoading, pagination, ...cardsApi } = useCards()

// 添加会员响应类型
interface MemberResponse {
  data: {
    list: {
      memberId: string
      name: string
      password: string
      sex: string | null
      birthday: string
    }[]
    pageTotal: number
  }
}

// 状态管理
const memberResponse = ref<MemberResponse | null>(null)
const showRegisterModal = ref(false)
const showRechargeModal = ref(false)
const selectedCard = ref<Card | null>(null)

// 工具函数
const { init: notify } = useToast()
const { confirm } = useModal()
const router = useRouter()

// 添加排序和搜索相关的状态
const sortBy = ref<'name' | 'cardCount'>('cardCount')
const searchName = ref('')

// 添加新的状态
const showSelectMembersModal = ref(false)
const selectedMembers = ref<string[]>([])

// 计算是否全选
const isAllSelected = computed(
  () => membersWithoutCards.value.length > 0 && selectedMembers.value.length === membersWithoutCards.value.length,
)

// 全选/取消全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedMembers.value = []
  } else {
    selectedMembers.value = membersWithoutCards.value.map((m) => m.memberId)
  }
}

// 生命周期钩子
onMounted(async () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (!isLoggedIn) {
    router.push('/admin/login')
    return
  }

  // 先获取会员列表
  try {
    const response = await memberAPI.getMemberList({
      pageIndex: 1,
      pageSize: 1000,
      name: '',
      birthdayQuery: '',
    })
    memberResponse.value = response
  } catch (error) {
    console.error('Failed to fetch members:', error)
  }

  // 再获取卡片信息
  await cardsApi.fetch()
})

// 事件处理函数
const handleRegisterCard = async (memberId: string) => {
  try {
    await cardsApi.register(memberId)
    notify({
      message: '会员卡注册成功',
      color: 'success',
    })
    showRegisterModal.value = false
    await cardsApi.fetch()
  } catch (error) {
    notify({
      message: '会员卡注册失败',
      color: 'danger',
    })
  }
}

const handleRecharge = async (params: { cardId: string; value: number }) => {
  try {
    await cardsApi.recharge({
      cardId: params.cardId,
      value: params.value.toString(),
    })
    notify({
      message: '充值成功',
      color: 'success',
    })
    showRechargeModal.value = false
    await cardsApi.fetch()
  } catch (error) {
    notify({
      message: '充值失败',
      color: 'danger',
    })
  }
}

const handleLoseCard = async (card: Card) => {
  const agreed = await confirm({
    title: '挂失确认',
    message: `确定要挂失卡号为 ${card.cardId} 的会员卡吗？`,
    okText: '确定',
    cancelText: '取消',
  })

  if (agreed) {
    try {
      await cardsApi.lose(card.cardId)
      notify({
        message: '会员卡已挂失',
        color: 'success',
      })
      await cardsApi.fetch()
    } catch (error) {
      notify({
        message: '挂失失败',
        color: 'danger',
      })
    }
  }
}

const handleCancelLose = async (card: Card) => {
  try {
    const response = await cardsApi.cancelLose(card.cardId)
    notify({
      message: '解挂成功',
      color: 'success',
    })
    await cardsApi.fetch()
  } catch (error) {
    notify({
      message: '解挂失败',
      color: 'danger',
    })
  }
}

const handleReissueCard = async (card: Card) => {
  const agreed = await confirm({
    title: '补卡确认',
    message: `确定要为卡号为 ${card.cardId} 理补卡吗？`,
    okText: '确定',
    cancelText: '取消',
  })

  if (agreed) {
    try {
      await cardsApi.reissue(card.cardId)
      notify({
        message: '补卡成功',
        color: 'success',
      })
      await cardsApi.fetch()
    } catch (error) {
      notify({
        message: '补卡失败',
        color: 'danger',
      })
    }
  }
}

const handleDeleteCard = async (card: Card) => {
  const agreed = await confirm({
    title: '注销确认',
    message: `确定要注销卡号为 ${card.cardId} 的会员卡吗？此操作不可恢复！`,
    okText: '注销',
    cancelText: '取消',
    color: 'danger',
  })

  if (agreed) {
    try {
      await cardsApi.deleteCard(card.cardId)
      notify({
        message: '会员卡已注销',
        color: 'success',
      })
      await cardsApi.fetch()
    } catch (error) {
      notify({
        message: '注销失败',
        color: 'danger',
      })
    }
  }
}

// 分页处理
const onPageChange = (page: number) => {
  pagination.value.page = page
}

const onPerPageChange = (perPage: number) => {
  pagination.value.perPage = perPage
  pagination.value.page = 1
}

const handlePaginationUpdate = (newPagination: { page: number; perPage: number; total: number }) => {
  pagination.value = newPagination
}

// 模态关闭前确认
const beforeModalClose = async (done: () => void) => {
  done()
}

// 定义会员卡组类型
interface MemberCardGroup {
  memberId: string
  name: string
  cards: Card[]
}

// 组织会员卡数据
const memberCards = computed(() => {
  if (!cards.value.length || !memberResponse.value) {
    return []
  }

  const groups: { [key: string]: MemberCardGroup } = {}

  cards.value.forEach((card) => {
    if (!groups[card.memberId]) {
      const member = memberResponse.value.data.list.find((m) => m.memberId === card.memberId)
      groups[card.memberId] = {
        memberId: card.memberId,
        name: member?.name || '未知用户',
        cards: [],
      }
    }
    groups[card.memberId].cards.push(card)
  })

  let result = Object.values(groups)

  // 搜索过滤
  if (searchName.value) {
    result = result.filter((member) => member.name.toLowerCase().includes(searchName.value.toLowerCase()))
  }

  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    } else {
      const cardDiff = b.cards.length - a.cards.length
      return cardDiff === 0 ? a.name.localeCompare(b.name) : cardDiff
    }
  })

  return result
})

// 搜索处理函数
const handleSearch = () => {
  // 搜索逻辑已经在 computed 中实现
}

// 计算未办卡会员列表
const membersWithoutCards = computed(
  () =>
    memberResponse.value?.data.list.filter(
      (member) => !memberCards.value.some((m) => m.memberId === member.memberId),
    ) || [],
)

// 切换会员选择
const toggleMemberSelection = (memberId: string) => {
  const index = selectedMembers.value.indexOf(memberId)
  if (index === -1) {
    selectedMembers.value.push(memberId)
  } else {
    selectedMembers.value.splice(index, 1)
  }
}

// 修改注册处理函数
const handleRegisterForNoCards = async () => {
  const membersToRegister = membersWithoutCards.value.filter((m) => selectedMembers.value.includes(m.memberId))

  if (membersToRegister.length === 0) {
    notify({
      message: '没有需要注册的会员',
      color: 'info',
    })
    return
  }

  const agreed = await confirm({
    title: '批量注册确认',
    message: `确定要为选中的 ${membersToRegister.length} 名会员注册会员卡吗？`,
    okText: '确定',
    cancelText: '取消',
  })

  if (agreed) {
    try {
      await Promise.all(membersToRegister.map((member) => cardsApi.register(member.memberId)))

      notify({
        message: `成功为 ${membersToRegister.length} 名会员注册会员卡`,
        color: 'success',
      })

      showSelectMembersModal.value = false
      selectedMembers.value = []
      await cardsApi.fetch()
    } catch (error) {
      notify({
        message: '批量注册失败',
        color: 'danger',
      })
    }
  }
}

// 添加处理函数
const handleShowRecharge = (card: Card) => {
  selectedCard.value = card
  showRechargeModal.value = true
}
</script>

<style scoped>
.cards-page {
  padding: 1rem;
}

.page-title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.member-panels {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.toolbar {
  background-color: var(--va-background-primary);
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

/* 响应式布局 */
@media (max-width: 640px) {
  .toolbar {
    gap: 1rem;
  }

  .search-input {
    width: 160px;
  }
}

.sort-toolbar {
  background-color: var(--va-background-primary);
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.register-all-btn {
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  min-width: 220px;
  height: 40px;
}

.register-all-btn .va-icon {
  font-size: 1.25rem;
}

@media (max-width: 960px) {
  .toolbar {
    flex-direction: column;
    gap: 1rem;
  }

  .register-all-btn {
    width: 100%;
    justify-content: center;
  }

  .flex.gap-4 {
    width: 100%;
    justify-content: center;
  }
}

.select-members-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.member-item {
  padding: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.member-item:hover {
  background-color: var(--va-background-secondary);
}

.member-item.selected {
  background-color: var(--va-primary-opacity-3);
}

.modal-btn {
  min-width: 100px;
  height: 40px;
  padding: 0 1.25rem;
}

.select-all-row {
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid var(--va-border);
  margin-bottom: 0.5rem;
}

.select-all-btn {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.875rem;
  height: 32px;
}

.select-all-btn:hover {
  background-color: var(--va-background-element);
}

.select-all-btn .va-icon {
  font-size: 1.25rem;
}
</style>
