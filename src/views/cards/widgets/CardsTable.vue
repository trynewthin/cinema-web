<template>
  <div class="va-data-table">
    <!-- 表头 -->
    <div class="va-data-table__header">
      <table class="va-data-table__table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cards" :key="item.cardId">
            <td>{{ item.cardId }}</td>
            <td>{{ item.memberId }}</td>
            <td>{{ item.balance }}元</td>
            <td>{{ item.integral }}</td>
            <td>
              <VaBadge :color="item.lose ? 'danger' : 'success'">
                {{ item.lose ? '已挂失' : '正常' }}
              </VaBadge>
            </td>
            <td>
              <div class="flex gap-2">
                <VaButton size="small" :disabled="item.lose" @click="$emit('recharge', item)"> 充值 </VaButton>

                <VaButton v-if="!item.lose" size="small" color="warning" @click="$emit('loseCard', item)">
                  挂失
                </VaButton>

                <VaButton v-else size="small" @click="$emit('cancelLose', item)"> 解挂 </VaButton>

                <VaButton v-if="item.lose" size="small" color="info" @click="$emit('reissueCard', item)">
                  补卡
                </VaButton>

                <VaButton size="small" color="success" @click="$emit('showRecords', item)"> 交易记录 </VaButton>

                <VaButton size="small" color="danger" @click="$emit('deleteCard', item)"> 注销 </VaButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 只在数据量大于每页显示数量时才显示分页 -->
    <div v-if="pagination.total > 10" class="va-data-table__footer">
      <VaPagination
        v-model="pagination.page"
        :total="pagination.total"
        :per-page="pagination.perPage"
        @update:page="$emit('update:page', $event)"
        @update:perPage="$emit('update:perPage', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '../types'

defineProps<{
  cards: Card[]
  loading: boolean
  pagination: {
    page: number
    perPage: number
    total: number
  }
}>()

defineEmits<{
  (e: 'recharge', card: Card): void
  (e: 'loseCard', card: Card): void
  (e: 'cancelLose', card: Card): void
  (e: 'reissueCard', card: Card): void
  (e: 'showRecords', card: Card): void
  (e: 'deleteCard', card: Card): void
  (e: 'update:page', page: number): void
  (e: 'update:perPage', perPage: number): void
  (e: 'updatePagination', pagination: { page: number; perPage: number; total: number }): void
}>()

const columns = [
  {
    key: 'cardId',
    title: '卡号',
  },
  {
    key: 'memberId',
    title: '会员ID',
  },
  {
    key: 'balance',
    title: '余额',
  },
  {
    key: 'integral',
    title: '积分',
  },
  {
    key: 'lose',
    title: '状态',
  },
  {
    key: 'actions',
    title: '操作',
  },
]
</script>

<style scoped>
.va-data-table {
  width: 100%;
  border: 1px solid var(--va-border);
  border-radius: var(--va-border-radius);
}

.va-data-table__table {
  width: 100%;
  border-collapse: collapse;
}

.va-data-table__table th,
.va-data-table__table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--va-border);
}

.va-data-table__footer {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
