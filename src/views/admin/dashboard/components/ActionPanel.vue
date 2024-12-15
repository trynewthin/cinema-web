<template>
  <VaCard class="action-panel" style="height: 180px; width: 100%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)">
    <VaCardContent class="p-4">
      <div class="flex flex-col gap-4">
        <VaButton class="action-btn" size="large" icon="local_activity" @click="showTicketDialog = true">
          购买电影票
        </VaButton>

        <VaButton class="action-btn" size="large" color="success" icon="redeem" @click="showExchangeDialog = true">
          积分兑换
        </VaButton>
      </div>
    </VaCardContent>
  </VaCard>

  <!-- 购票对话框 -->
  <VaModal v-model="showTicketDialog" title="购买电影票" size="large" hide-default-actions>
    <div class="ticket-dialog">
      <!-- 电影选择面板 -->
      <div v-if="!selectedMovie" class="exchange-panel">
        <div class="section-title mb-2">选择电影</div>
        <VaInput v-model="movieSearch" placeholder="搜索电影名称" class="mb-2" clearable>
          <template #prependInner>
            <VaIcon name="search" />
          </template>
        </VaInput>

        <div class="movie-list">
          <div
            v-for="movie in filteredMovies"
            :key="movie.movieId"
            class="movie-item"
            :class="{ selected: selectedMovie?.movieId === movie.movieId }"
            @click="selectedMovie = movie"
          >
            <div class="flex items-center gap-3">
              <VaIcon name="movie" color="primary" />
              <div class="flex-1">
                <div class="movie-name">{{ movie.name }}</div>
                <div class="movie-time text-sm text-gray-500">
                  {{ formatDate(movie.time) }}
                </div>
              </div>
              <div class="movie-price">¥{{ movie.price }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 购买方式面板 -->
      <div v-else class="exchange-panel">
        <div class="flex justify-between items-center mb-4">
          <div class="section-title">选择支付方式</div>
          <VaButton preset="secondary" size="small" icon="arrow_back" @click="selectedMovie = null">
            重新选择电影
          </VaButton>
        </div>

        <!-- 已选电影信息 -->
        <div class="selected-movie mb-4">
          <div class="flex items-center gap-3 p-3 bg-primary-opacity rounded-lg">
            <VaIcon name="movie" color="primary" />
            <div class="flex-1">
              <div class="font-medium">{{ selectedMovie.name }}</div>
              <div class="text-sm text-gray-500">
                {{ formatDate(selectedMovie.time) }}
              </div>
            </div>
            <div class="text-lg font-bold text-primary">¥{{ selectedMovie.price }}</div>
          </div>
        </div>

        <!-- 会员和支付信息 -->
        <div class="flex gap-4">
          <!-- 左侧：会员选择 -->
          <div class="w-1/2 payment-panel">
            <div class="section-title mb-2">选择会员</div>
            <VaInput v-model="memberSearch" placeholder="搜索会员姓名" class="mb-2" clearable>
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>

            <div class="member-list">
              <div
                v-for="member in filteredMembers"
                :key="member.memberId"
                class="member-item"
                :class="{
                  selected: selectedMember?.memberId === member.memberId,
                }"
                @click="handleMemberSelect(member)"
              >
                <div class="flex items-center gap-3">
                  <VaIcon name="person" color="primary" />
                  <div class="flex-1">
                    <div class="member-name">{{ member.name }}</div>
                    <div class="member-id text-sm text-gray-500">ID: {{ member.memberId }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：支付方式和会员卡 -->
          <div class="w-1/2 payment-panel">
            <template v-if="selectedMember">
              <div class="section-title mb-2">支付方式</div>
              <div class="payment-methods mb-4">
                <div class="flex gap-2">
                  <VaButton
                    :preset="paymentMethod === 'balance' ? 'primary' : 'secondary'"
                    class="flex-1"
                    @click="paymentMethod = 'balance'"
                  >
                    余额支付
                  </VaButton>
                  <VaButton
                    :preset="paymentMethod === 'points' ? 'primary' : 'secondary'"
                    class="flex-1"
                    @click="paymentMethod = 'points'"
                  >
                    积分支付
                    <template v-if="selectedMovie"> ({{ Math.ceil(selectedMovie.price * 100) }}积分) </template>
                  </VaButton>
                </div>
              </div>

              <div class="section-title mb-2">选择会员卡</div>
              <div v-if="memberCards.length" class="card-list">
                <div
                  v-for="card in memberCards"
                  :key="card.cardId"
                  class="card-item"
                  :class="{
                    selected: selectedCard?.cardId === card.cardId,
                    disabled: isCardDisabled(card),
                  }"
                  @click="handleCardSelect(card)"
                >
                  <div class="flex items-center gap-3">
                    <VaIcon name="credit_card" color="primary" />
                    <div class="flex-1">
                      <div class="card-id">卡号: {{ card.cardId }}</div>
                      <div class="card-balance text-sm">
                        <template v-if="paymentMethod === 'balance'">
                          余额: ¥{{ Number(card.balance).toFixed(2) }}
                        </template>
                        <template v-else> 积分: {{ Number(card.integral || 0) }} </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="flex items-center justify-center h-full text-gray-500">请先选择会员</div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="exchange-footer">
        <VaButton preset="secondary" @click="showTicketDialog = false"> 取消 </VaButton>
        <VaButton :disabled="!canPurchase" @click="handlePurchase"> 确认购买 </VaButton>
      </div>
    </div>
  </VaModal>

  <!-- 积分兑换对话框 -->
  <VaModal v-model="showExchangeDialog" title="积分兑换" size="large" hide-default-actions>
    <div class="exchange-dialog">
      <!-- 商品选择面板 -->
      <div v-if="!selectedGood" class="exchange-panel">
        <div class="section-title mb-2">选择兑换商品</div>
        <div class="goods-grid">
          <div
            v-for="good in exchangeGoods"
            :key="good.id"
            class="good-item"
            :class="{
              selected: selectedGood?.id === good.id,
            }"
            @click="handleGoodSelect(good)"
          >
            <div class="good-icon">
              <VaIcon :name="good.icon" size="large" color="primary" />
            </div>
            <div class="good-name">{{ good.name }}</div>
            <div class="good-points">{{ good.points }} 积分</div>
          </div>
        </div>
      </div>

      <!-- 支付面板 -->
      <div v-else class="exchange-panel">
        <div class="flex justify-between items-center mb-4">
          <div class="section-title">选择支付方式</div>
          <VaButton preset="secondary" size="small" icon="arrow_back" @click="selectedGood = null">
            重新选择商品
          </VaButton>
        </div>

        <!-- 已选商品信息 -->
        <div class="selected-good mb-4">
          <div class="flex items-center gap-3 p-3 bg-primary-opacity rounded-lg">
            <VaIcon :name="selectedGood.icon" color="primary" />
            <div class="flex-1">
              <div class="font-medium">{{ selectedGood.name }}</div>
            </div>
            <div class="text-lg font-bold text-primary">{{ selectedGood.points }} 积分</div>
          </div>
        </div>

        <!-- 会员和会员卡选择 -->
        <div class="flex gap-4">
          <!-- 左侧：会员选择 -->
          <div class="w-1/2 payment-panel">
            <div class="section-title mb-2">选择会员</div>
            <VaInput v-model="memberSearch" placeholder="搜索会员姓名" class="mb-2" clearable>
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>

            <div class="member-list mb-4">
              <div
                v-for="member in filteredMembers"
                :key="member.memberId"
                class="member-item"
                :class="{
                  selected: selectedExchangeMember?.memberId === member.memberId,
                }"
                @click="handleExchangeMemberSelect(member)"
              >
                <div class="flex items-center gap-3">
                  <VaIcon name="person" color="primary" />
                  <div class="flex-1">
                    <div class="member-name">{{ member.name }}</div>
                    <div class="member-id text-sm text-gray-500">ID: {{ member.memberId }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：会员卡选择 -->
          <div class="w-1/2 payment-panel">
            <template v-if="selectedExchangeMember">
              <div class="section-title mb-2">选择会员卡</div>
              <div v-if="memberCards.length" class="card-list">
                <div
                  v-for="card in memberCards"
                  :key="card.cardId"
                  class="card-item"
                  :class="{
                    selected: selectedExchangeCard?.cardId === card.cardId,
                    disabled: (card.integral || 0) < selectedGood.points,
                  }"
                  @click="handleExchangeCardSelect(card)"
                >
                  <div class="flex items-center gap-3">
                    <VaIcon name="credit_card" color="primary" />
                    <div class="flex-1">
                      <div class="card-id">卡号: {{ card.cardId }}</div>
                      <div class="card-points text-sm">积分: {{ Number(card.integral || 0) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="flex items-center justify-center h-full text-gray-500">请先选择会员</div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="exchange-footer">
        <VaButton preset="secondary" @click="showExchangeDialog = false"> 取消 </VaButton>
        <VaButton :disabled="!canExchange" @click="handleExchange"> 确认兑换 </VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vuestic-ui'
import { movieAPI, memberAPI, cardAPI } from '@/api'
import type { Movie, Member, Card } from '@/api/types'

const { init: showToast } = useToast()

// 状态变量
const showTicketDialog = ref(false)
const showExchangeDialog = ref(false)
const movieSearch = ref('')
const memberSearch = ref('')
const selectedMovie = ref<Movie | null>(null)
const selectedMember = ref<Member | null>(null)
const selectedCard = ref<Card | null>(null)
const paymentMethod = ref<'balance' | 'points'>('balance')
const memberCards = ref<Card[]>([])
const allMovies = ref<Movie[]>([])
const allMembers = ref<Member[]>([])

// 过滤后的电影列表
const filteredMovies = computed(() => {
  if (!movieSearch.value) return allMovies.value
  const search = movieSearch.value.toLowerCase()
  return allMovies.value.filter((movie) => movie.name.toLowerCase().includes(search))
})

// 过滤后的会员列表
const filteredMembers = computed(() => {
  if (!memberSearch.value) return allMembers.value
  const search = memberSearch.value.toLowerCase()
  return allMembers.value.filter((member) => member.name.toLowerCase().includes(search))
})

// 加载电影列表
const loadMovies = async () => {
  try {
    const response = await movieAPI.getMovieList({
      pageIndex: 1,
      pageSize: 1000,
    })
    if (response.status === 200 && response.data) {
      allMovies.value = response.data.list
    }
  } catch (error) {
    console.error('Failed to fetch movies:', error)
    showToast({
      message: '加载电影失败',
      color: 'danger',
    })
  }
}

// 加载会员列表
const loadMembers = async () => {
  try {
    const response = await memberAPI.getMemberList({
      pageIndex: 1,
      pageSize: 1000,
    })
    if (response.status === 200 && response.data) {
      allMembers.value = response.data.list
    }
  } catch (error) {
    console.error('Failed to fetch members:', error)
    showToast({
      message: '加载会员列表失败',
      color: 'danger',
    })
  }
}

// 监听购票对话框打开
watch(showTicketDialog, (newValue) => {
  if (newValue) {
    loadMovies()
    loadMembers()
    resetPurchase()
  }
})

// 监听积分兑换对话框打开
watch(showExchangeDialog, (newValue) => {
  if (newValue) {
    loadMembers()
    resetExchange()
  }
})

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

// 重置购买状态
const resetPurchase = () => {
  selectedMovie.value = null
  selectedMember.value = null
  selectedCard.value = null
  paymentMethod.value = 'balance'
  memberCards.value = []
  movieSearch.value = ''
  memberSearch.value = ''
}

// 重置兑换状态
const resetExchange = () => {
  selectedExchangeMember.value = null
  selectedExchangeCard.value = null
  selectedGood.value = null
  memberCards.value = []
  memberSearch.value = ''
}

// 积分兑换相关
const selectedExchangeMember = ref<Member | null>(null)
const selectedExchangeCard = ref<Card | null>(null)

// 模拟商品数据
const exchangeGoods = [
  { id: 1, name: '爆米花', points: 500, icon: 'local_cafe' },
  { id: 2, name: '可乐', points: 300, icon: 'local_drink' },
  { id: 3, name: '电影周边', points: 1000, icon: 'card_giftcard' },
  { id: 4, name: '电影报', points: 800, icon: 'image' },
  { id: 5, name: '3D眼镜', points: 600, icon: 'visibility' },
  { id: 6, name: '电影票优惠券', points: 1500, icon: 'local_activity' },
]

// 购票步骤配置
const ticketSteps = [{ title: '选择电影' }, { title: '选择会员' }, { title: '选择支付方式' }]

// 当前步骤标题
const currentStep = computed(() => {
  if (!selectedMovie.value) return '选择电影'
  if (!selectedMember.value) return '选择会员'
  return '选择支付方式'
})

// 是否可以进行下一步
const canProceed = computed(() => {
  if (!selectedMovie.value) return false
  if (!selectedMember.value) return false
  return true
})

// 是否可以购买
const canPurchase = computed(() => {
  if (!selectedMovie.value || !selectedCard.value || !selectedMember.value) return false

  const price = Number(selectedMovie.value.price)
  if (paymentMethod.value === 'balance') {
    return selectedCard.value.balance >= price
  } else {
    return (selectedCard.value.integral || 0) >= price * 100
  }
})

// 检查会员卡是否可用
const isCardDisabled = (card: Card) => {
  if (!selectedMovie.value) return false
  const price = Number(selectedMovie.value.price)
  if (paymentMethod.value === 'balance') {
    return card.balance < price
  } else {
    return (card.integral || 0) < price * 100
  }
}

// 处理会员选择
const handleMemberSelect = async (member: Member) => {
  selectedMember.value = member
  selectedCard.value = null
  paymentMethod.value = 'balance'

  try {
    const response = await cardAPI.getCardList({
      pageIndex: 1,
      pageSize: 100,
      memberId: member.memberId,
      status: 'normal',
    })
    if (response.status === 200 && response.data) {
      memberCards.value = response.data.list.map((card) => ({
        ...card,
        points: Number(card.integral || 0),
        balance: Number(card.balance || 0),
      }))
      console.log('会员卡列表:', memberCards.value)
    }
  } catch (error) {
    console.error('Failed to fetch member cards:', error)
    showToast({
      message: '获取会员卡失败',
      color: 'danger',
    })
  }
}

// 处理会员卡选择
const handleCardSelect = (card: Card) => {
  if (isCardDisabled(card)) return
  selectedCard.value = card
}

// 处理购买
const handlePurchase = async () => {
  if (!selectedMovie.value || !selectedCard.value) return

  try {
    const response = await cardAPI.consumeCard({
      cardId: selectedCard.value.cardId,
      price: paymentMethod.value === 'points' ? '0' : Math.ceil(selectedMovie.value.price).toString(),
      integral:
        paymentMethod.value === 'points'
          ? (-Math.ceil(selectedMovie.value.price * 100)).toString()
          : Math.ceil(selectedMovie.value.price).toString(),
    })

    if (response.status === 200) {
      const message =
        paymentMethod.value === 'points'
          ? `使用${Math.ceil(selectedMovie.value.price * 100)}积分购买成功！`
          : `购买成功，获得${Math.ceil(selectedMovie.value.price)}积分！`

      showToast({
        message,
        color: 'success',
      })

      // 更新电影售出数量
      try {
        await movieAPI.modifyMovie({
          ...selectedMovie.value,
          ticketsSold: (selectedMovie.value.ticketsSold || 0) + 1,
        })
      } catch (error) {
        console.error('更新电影售出数量失败:', error)
      }

      showTicketDialog.value = false
      resetPurchase()
    } else {
      showToast({
        message: response.message || '购买失败',
        color: 'danger',
      })
    }
  } catch (error) {
    console.error('购买过程出错:', error)
    console.error('错误详情:', {
      response: error.response,
      message: error.message,
      stack: error.stack,
    })

    showToast({
      message: error.response?.data?.message || '购买失败，请重试',
      color: 'danger',
    })
  }
}

// 处理积分兑换会员选择
const handleExchangeMemberSelect = async (member: Member) => {
  selectedExchangeMember.value = member
  selectedExchangeCard.value = null

  try {
    const response = await cardAPI.getCardList({
      pageIndex: 1,
      pageSize: 100,
      memberId: member.memberId,
      status: 'normal',
    })
    if (response.status === 200 && response.data) {
      memberCards.value = response.data.list.map((card) => ({
        ...card,
        points: Number(card.integral || 0),
        balance: Number(card.balance || 0),
      }))
      console.log('兑换用的会员卡列表:', memberCards.value)
    }
  } catch (error) {
    console.error('Failed to fetch member cards:', error)
    showToast({
      message: '获取会员卡失败',
      color: 'danger',
    })
  }
}

// 处理积分兑换会员卡选择
const handleExchangeCardSelect = (card: Card) => {
  if ((card.integral || 0) < (selectedGood.value?.points || 0)) return
  selectedExchangeCard.value = card
}

// 处理积分兑换
const handleExchange = async () => {
  if (!selectedExchangeCard.value || !selectedGood.value || !selectedExchangeMember.value) return

  try {
    const response = await cardAPI.exchangePoints({
      memberId: selectedExchangeMember.value.memberId,
      integral: selectedGood.value.points.toString(),
    })

    if (response.status === 200) {
      showToast({
        message: `使用${selectedGood.value.points}积分兑换${selectedGood.value.name}成功！`,
        color: 'success',
      })
      showExchangeDialog.value = false
      resetExchange()
    } else {
      showToast({
        message: response.message || '兑换失败',
        color: 'danger',
      })
    }
  } catch (error) {
    console.error('兑换过程出错:', error)
    console.error('错误详情:', {
      response: error.response,
      message: error.message,
      stack: error.stack,
    })

    showToast({
      message: error.response?.data?.message || '兑换失败，请重试',
      color: 'danger',
    })
  }
}

// 添加选中的商品状态
const selectedGood = ref<(typeof exchangeGoods)[0] | null>(null)

// 修改是否可兑换的计算属性
const canExchange = computed(() => {
  if (!selectedExchangeCard?.value || !selectedGood?.value) return false
  return (selectedExchangeCard.value.integral || 0) >= selectedGood.value.points
})

// 修改商品选择处理
const handleGoodSelect = (good: (typeof exchangeGoods)[0]) => {
  selectedGood.value = good
  selectedExchangeMember.value = null
  selectedExchangeCard.value = null
  memberCards.value = []
}
</script>

<style lang="scss" scoped>
.action-panel {
  .action-btn {
    width: 100%;
    height: 60px;
    font-size: 1.1rem;
  }
}

.ticket-dialog {
  .exchange-panel {
    padding: 1.5rem;
    border-radius: 0.75rem;
    background-color: var(--va-background-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--va-background-element);
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .selected-movie {
    .bg-primary-opacity {
      background-color: var(--va-primary-opacity);
    }

    .text-primary {
      color: var(--va-primary);
    }
  }

  .movie-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 0.5rem;
    margin: 0 -0.5rem;
  }

  .movie-item {
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-color: var(--va-background-element);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;

    &:hover:not(.disabled) {
      transform: translateY(-2px);
      border-color: var(--va-primary-opacity);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &.selected {
      background-color: var(--va-primary-opacity);
      border-color: var(--va-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.2);

      .movie-name {
        color: var(--va-primary);
        font-weight: 500;
        font-size: 1.1rem;
      }

      .movie-time {
        color: var(--va-primary);
        opacity: 0.8;
      }

      .movie-price {
        color: var(--va-primary);
        font-weight: bold;
        font-size: 1.2rem;
      }

      .va-icon {
        transform: scale(1.1);
        color: var(--va-primary) !important;
      }
    }
  }

  .member-list,
  .card-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 0.5rem;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--va-background-element);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--va-primary);
      border-radius: 3px;

      &:hover {
        background: var(--va-primary-dark);
      }
    }
  }

  .payment-panel {
    background-color: var(--va-background-primary);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 2px solid var(--va-background-element);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--va-primary-opacity);
    }
  }

  .exchange-footer {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
    padding: 1.5rem 0 0.5rem;
    border-top: 1px solid var(--va-background-element);

    .va-button {
      min-width: 120px;
    }
  }

  .member-item,
  .card-item {
    padding: 1rem;
    border-radius: 0.75rem;
    background-color: var(--va-background-element);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    margin-bottom: 0.75rem;

    &:hover:not(.disabled) {
      transform: translateY(-2px);
      border-color: var(--va-primary-opacity);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &.selected {
      background-color: var(--va-primary-opacity);
      border-color: var(--va-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.2);

      .member-name,
      .card-id {
        color: var(--va-primary);
        font-weight: 500;
        font-size: 1.1rem;
      }

      .member-id,
      .card-balance {
        color: var(--va-primary);
        opacity: 0.8;
      }

      .va-icon {
        transform: scale(1.2);
        color: var(--va-primary) !important;
      }
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      &:hover {
        transform: none;
        border-color: transparent;
        box-shadow: none;
      }
    }

    .va-icon {
      transition: transform 0.2s ease;
      font-size: 1.5rem;
    }

    .member-name,
    .card-id,
    .member-id,
    .card-balance {
      transition: all 0.2s ease;
    }
  }

  .payment-methods {
    .va-button {
      padding: 0.5rem 1rem;
      font-size: 1rem;

      &.va-button--preset-primary {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(var(--va-primary-rgb), 0.15);
      }
    }
  }
}

.exchange-dialog {
  .exchange-panel {
    padding: 1.5rem;
    border-radius: 0.75rem;
    background-color: var(--va-background-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--va-background-element);
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .goods-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    .good-item {
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: var(--va-background-element);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      border: 2px solid transparent;

      &:hover:not(.disabled) {
        transform: translateY(-2px);
        border-color: var(--va-primary-opacity);
      }

      &.selected {
        background-color: var(--va-primary-opacity);
        border-color: var(--va-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.2);

        .good-name {
          color: var(--va-primary);
        }

        .good-points {
          color: var(--va-primary);
          font-weight: bold;
        }

        .good-icon {
          transform: scale(1.1);
        }
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .good-icon {
        margin-bottom: 0.5rem;
        transition: transform 0.2s ease;
      }

      .good-name {
        font-weight: 500;
        margin-bottom: 0.25rem;
        transition: color 0.2s ease;
      }

      .good-points {
        font-size: 0.875rem;
        color: var(--va-primary);
        transition: all 0.2s ease;
      }
    }
  }

  .member-list,
  .card-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .exchange-footer {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--va-background-element);

    .va-button {
      min-width: 120px;
    }
  }
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

.movie-list,
.member-list,
.card-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.exchange-dialog {
  .member-item,
  .card-item {
    padding: 1rem;
    border-radius: 0.75rem;
    background-color: var(--va-background-element);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    margin-bottom: 0.75rem;

    &:hover:not(.disabled) {
      transform: translateY(-2px);
      border-color: var(--va-primary-opacity);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &.selected {
      background-color: var(--va-primary-opacity);
      border-color: var(--va-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.2);

      .member-name,
      .card-id {
        color: var(--va-primary);
        font-weight: 500;
        font-size: 1.1rem;
      }

      .member-id,
      .card-balance {
        color: var(--va-primary);
        opacity: 0.8;
      }

      .va-icon {
        transform: scale(1.2);
        color: var(--va-primary) !important;
      }
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      &:hover {
        transform: none;
        border-color: transparent;
        box-shadow: none;
      }
    }

    .va-icon {
      transition: transform 0.2s ease;
      font-size: 1.5rem;
    }

    .member-name,
    .card-id,
    .member-id,
    .card-balance {
      transition: all 0.2s ease;
    }
  }

  .member-list,
  .card-list {
    max-height: 300px;
    overflow-y: auto;
    padding: 0.5rem;
    margin: 0 -0.5rem;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--va-background-element);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--va-primary);
      border-radius: 3px;

      &:hover {
        background: var(--va-primary-dark);
      }
    }
  }

  .payment-methods {
    .va-button {
      padding: 1rem;
      font-size: 1.1rem;

      &.va-button--preset-primary {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.2);
      }
    }
  }
}
</style>
