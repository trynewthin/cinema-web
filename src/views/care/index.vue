<template>
  <div class="member-care">
    <h1 class="page-title text-2xl font-bold mb-6">会员关怀</h1>

    <!-- 生日关怀面板 -->
    <VaCard class="mb-4">
      <VaCardTitle class="text-xl font-bold">生日关怀</VaCardTitle>
      <VaCardContent>
        <BirthdayCarePanel />
      </VaCardContent>
    </VaCard>

    <!-- 这里可以添加其他关怀面板，比如：
    - 消费关怀面板
    - 活动关怀面板
    - 节日关怀面板
    等等 -->
  </div>
</template>

<script lang="ts" setup>
import BirthdayCarePanel from './components/BirthdayCarePanel.vue'
</script>

<style lang="scss" scoped>
.member-care {
  padding: 1rem;
}
</style>
