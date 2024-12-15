<template>
  <div class="dashboard">
    <section class="p-4">
      <!-- 第一行 -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="w-full sm:w-[320px]">
          <!-- 管理员信息面板 -->
          <AdminInfoPanel class="admin-panel" />
          <!-- 操作面板 -->
          <div class="mt-4">
            <ActionPanel />
          </div>
        </div>
        <div class="w-full sm:w-[800px]">
          <!-- 统计数据面板 -->
          <StatisticsPanel />
          <!-- 近期上映电影面板 -->
          <div class="mt-6">
            <UpcomingMoviesPanel />
          </div>
        </div>
      </div>

      <!-- 数据部分 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Data Sections -->
      </div>

      <!-- 第二行 -->
      <div class="flex flex-col md:flex-row gap-4">
        <div class="w-full md:w-4/6">
          <!-- Revenue By Location Map -->
        </div>
        <div class="w-full md:w-2/6">
          <!-- Region Revenue -->
        </div>
      </div>

      <!-- 第三行 -->
      <div class="flex flex-col md:flex-row gap-4">
        <div class="w-full md:w-1/2">
          <!-- Project Table -->
        </div>
        <div class="w-full md:w-1/2">
          <!-- Timeline -->
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import AdminInfoPanel from './components/AdminInfoPanel.vue'
import StatisticsPanel from './components/StatisticsPanel.vue'
import UpcomingMoviesPanel from './components/UpcomingMoviesPanel.vue'
import ActionPanel from './components/ActionPanel.vue'
</script>

<style lang="scss" scoped>
.admin-panel {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dashboard {
  min-height: 100vh;
  background-color: var(--va-background);
}
</style>
