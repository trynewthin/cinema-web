<template>
  <VaCard :class="['member-panel', `member-panel-${colorIndex}`]">
    <VaCardTitle class="member-header">
      <div class="header-content">
        <div class="member-info">
          <div class="text-xl font-bold">{{ member.name }}</div>
          <div class="text-sm text-gray-500">ID: {{ member.memberId }}</div>
        </div>
        <VaButton size="small" color="primary" class="register-btn" @click="$emit('register', member.memberId)">
          注册新卡
        </VaButton>
      </div>
    </VaCardTitle>

    <VaCardContent>
      <!-- 卡片数量统计 -->
      <div class="card-stats mb-4">
        <span class="text-sm text-gray-600">
          共 {{ cards.length }} 张会员卡 | 正常: {{ cards.filter((c) => !c.lose).length }} 张 | 挂失:
          {{ cards.filter((c) => c.lose).length }} 张
        </span>
      </div>

      <div class="cards-grid">
        <VaCard
          v-for="card in cards"
          :key="card.cardId"
          :class="['card-item', { selected: selectedCard?.cardId === card.cardId }]"
          :data-balance="getBalanceLevel(card.balance)"
          @click="selectCard(card)"
        >
          <VaCardContent>
            <div class="card-layout">
              <div class="card-top">
                <div class="card-id text-sm">卡号: {{ card.cardId }}</div>
                <VaBadge :color="card.lose ? 'danger' : 'success'">
                  {{ card.lose ? '已挂失' : '正常' }}
                </VaBadge>
              </div>
              <div class="card-middle">
                <span class="card-balance">{{ card.balance }}元</span>
              </div>
              <div class="card-bottom">
                <span class="card-points">积分: {{ card.integral }}</span>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- 卡片操作区 -->
      <div v-if="selectedCard" class="card-operations mt-4">
        <div class="selected-card-info mb-2 text-sm text-gray-600">已选择卡号: {{ selectedCard.cardId }}</div>
        <div class="flex gap-2 flex-wrap">
          <VaButton size="small" :disabled="selectedCard.lose !== 0" @click="$emit('recharge', selectedCard)">
            充值
          </VaButton>

          <VaButton v-if="!selectedCard.lose" size="small" color="warning" @click="$emit('loseCard', selectedCard)">
            挂失
          </VaButton>

          <VaButton v-else size="small" @click="$emit('cancelLose', selectedCard)"> 解挂 </VaButton>

          <VaButton v-if="selectedCard.lose" size="small" color="info" @click="$emit('reissueCard', selectedCard)">
            补卡
          </VaButton>

          <VaButton size="small" color="success" @click="$emit('deleteCard', selectedCard)"> 注销 </VaButton>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card } from '../types'

interface Member {
  memberId: string
  name: string
}

const props = defineProps<{
  member: Member
  cards: Card[]
  index?: number // 添加索引属性于颜色区分
}>()

defineEmits<{
  (e: 'register', memberId: string): void
  (e: 'recharge', card: Card): void
  (e: 'loseCard', card: Card): void
  (e: 'cancelLose', card: Card): void
  (e: 'reissueCard', card: Card): void
  (e: 'deleteCard', card: Card): void
}>()

const selectedCard = ref<Card | null>(null)

const selectCard = (card: Card) => {
  selectedCard.value = selectedCard.value?.cardId === card.cardId ? null : card
}

// 计算面板颜色
const colorIndex = computed(() => {
  return (props.index || 0) % 6 // 6种不同的颜色
})

const getBalanceLevel = (balance: number) => {
  if (balance === 0) return '0'
  if (balance <= 1000) return '1-1000'
  return '1000+'
}
</script>

<style scoped>
.member-panel {
  margin-bottom: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  width: calc(50% - 0.5rem);
  min-width: 350px;
  max-width: 500px;
  height: fit-content;
  overflow: hidden;
  border: 1px solid var(--va-border);
}

/* 不同的面板颜色主题 */
.member-panel-0 {
  background-color: var(--va-background-primary);
  border-left: 6px solid var(--va-primary);
}

.member-panel-1 {
  background-color: #f0f9ff;
  border-left: 6px solid #3b82f6;
}

.member-panel-2 {
  background-color: #fdf2f8;
  border-left: 6px solid #ec4899;
}

.member-panel-3 {
  background-color: #f0fdf4;
  border-left: 6px solid #22c55e;
}

.member-panel-4 {
  background-color: #fff7ed;
  border-left: 6px solid #f97316;
}

.member-panel-5 {
  background-color: #f5f3ff;
  border-left: 6px solid #8b5cf6;
}

.member-panel:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.member-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--va-border);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-flow: dense;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.card-item {
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  border: 1px solid var(--va-border);
  padding: 0.5rem 0.75rem;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  border-radius: 0.5rem;
  height: fit-content;
  display: flex;
  flex-direction: column;
}

.card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.card-item.selected {
  border: 2px solid var(--va-primary);
  box-shadow: 0 0 0 1px var(--va-primary);
  background-color: var(--va-background-primary);
}

.card-operations {
  border-top: 1px solid var(--va-border);
  padding-top: 0.75rem;
  margin-top: 1rem;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  padding: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

.text-primary {
  color: var(--va-primary);
}

.card-stats {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--va-border);
  background-color: rgba(0, 0, 0, 0.02);
}

/* 响应式布局 */
@media (max-width: 960px) {
  .member-panel {
    width: 100%;
    margin: 0 0 1rem 0;
    min-width: unset;
  }

  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header-content {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .member-info {
    min-width: 200px;
  }
}

@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }

  .card-operations {
    padding: 0.75rem;
  }

  .header-content {
    gap: 0.75rem;
  }

  .member-info {
    min-width: 150px;
  }
}

.card-layout {
  display: flex;
  flex-direction: column;
  min-height: 90px;
  gap: 0.5rem;
  justify-content: space-between;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.card-middle {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
}

.card-bottom {
  margin-top: auto;
  padding-top: 0.25rem;
}

.card-id {
  color: var(--va-text-secondary);
  font-size: 0.875rem;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-balance {
  font-size: 1.125rem;
  font-weight: bold;
  color: var(--va-primary);
  line-height: 1.2;
}

.card-points {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

/* 状态标签样式 */
.va-badge {
  flex-shrink: 0;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  min-width: 250px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 1rem;
  flex-wrap: nowrap;
}

.register-btn {
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
}
</style>
