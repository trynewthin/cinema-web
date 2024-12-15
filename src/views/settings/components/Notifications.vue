<template>
  <div class="flex flex-col p-4 bg-backgroundSecondary rounded-lg">
    <h3 class="h3 mb-6">通知设置</h3>
    <div v-for="notification in localizedNotifications" :key="notification.name" class="group">
      <div class="flex items-center justify-between overflow-x-hidden">
        <p class="text-regularLarge">
          {{ notification.displayName }}
        </p>
        <VaSwitch v-model="notification.isEnabled" size="small" />
      </div>
      <VaDivider class="py-4 group-last:hidden" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useNotificationsStore } from '../../../stores/notifications'

const { notifications } = useNotificationsStore()

// 通知类型的中文映射
const notificationNameMap: Record<string, string> = {
  'Searching for a job': '求职相关通知',
  'Hiring someone': '招聘相关通知',
  'Connecting with others': '社交连接通知',
  'Posting and commenting': '发帖和评论通知',
  Messaging: '消息通知',
  Groups: '群组通知',
  Pages: '页面更新通知',
  'Attending events': '活动参与通知',
  'News and reports': '新闻和报告通知',
  'Updating your profile': '个人资料更新通知',
  Verifications: '验证通知',
}

// 本地化通知列表
const localizedNotifications = computed(() => {
  return notifications.map((notification) => ({
    ...notification,
    displayName: notificationNameMap[notification.name] || notification.name,
  }))
})
</script>
