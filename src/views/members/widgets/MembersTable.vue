<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Member } from '../types'
import { PropType, computed } from 'vue'

const columns = defineVaDataTableColumns([
  { label: '会员ID', key: 'memberId', sortable: true, align: 'center' },
  { label: '姓名', key: 'name', sortable: true, align: 'center' },
  { label: '性别', key: 'sex', sortable: true, align: 'center' },
  { label: '生日', key: 'birthday', sortable: true, align: 'center' },
  { label: '操作', key: 'actions', align: 'center' },
])

const props = defineProps({
  members: {
    type: Array as PropType<Member[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object as PropType<{ page: number; perPage: number; total: number }>,
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'edit-member', member: Member): void
  (event: 'delete-member', member: Member): void
  (event: 'updatePagination', pagination: { page: number; perPage: number; total: number }): void
}>()

const { confirm } = useModal()

const onMemberDelete = async (member: Member) => {
  const agreed = await confirm({
    title: '删除会员',
    message: `确定要删除会员 ${member.name} 吗？`,
    okText: '删除',
    cancelText: '取消',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-member', member)
  }
}

// 修改计算总页数的逻辑
const totalPages = computed(() => {
  const total = props.pagination.total
  const perPage = props.pagination.perPage
  return total ? Math.ceil(total / perPage) : 0
})

const updatePage = (newPage: number) => {
  emit('updatePagination', { ...props.pagination, page: newPage })
}

const updatePerPage = (newPerPage: number) => {
  emit('updatePagination', { ...props.pagination, perPage: newPerPage })
}
</script>

<template>
  <VaDataTable :columns="columns" :items="members" :loading="loading" class="members-table">
    <template #cell(sex)="{ rowData }">
      {{ rowData.sex === 'M' ? '男' : '女' }}
    </template>

    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-center">
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          aria-label="编辑会员"
          @click="$emit('edit-member', rowData as Member)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="删除会员"
          @click="onMemberDelete(rowData as Member)"
        />
      </div>
    </template>
  </VaDataTable>

  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ pagination.total }}</b> 条记录，每页显示
      <VaSelect
        :model-value="pagination.perPage"
        class="!w-20"
        :options="[10, 50, 100]"
        @update:modelValue="updatePerPage"
      />
      条
    </div>

    <div v-if="totalPages > 1" class="flex items-center gap-2">
      <VaButton
        preset="secondary"
        icon="chevron_left"
        :disabled="pagination.page === 1"
        @click="updatePage(pagination.page - 1)"
      />

      <div class="flex items-center">
        <VaPagination
          :model-value="pagination.page"
          buttons-preset="primary"
          :pages="totalPages"
          :visible-pages="5"
          :boundary-links="true"
          :direction-links="false"
          class="pagination-buttons"
          @update:modelValue="(page) => updatePage(page)"
        />
      </div>

      <VaButton
        preset="secondary"
        icon="chevron_right"
        :disabled="pagination.page === totalPages"
        @click="updatePage(pagination.page + 1)"
      />
    </div>
  </div>
</template>

<style scoped>
.members-table :deep(.va-data-table__table-td) {
  vertical-align: middle;
}

.members-table :deep(.va-data-table__table-th) {
  text-align: center;
}

.members-table :deep(.va-data-table__table-td) {
  text-align: center;
}

:deep(.pagination-buttons) {
  display: flex;
  gap: 0.5rem;
}

:deep(.pagination-buttons .va-button) {
  min-width: 36px;
  height: 36px;
  padding: 0;
}

:deep(.pagination-buttons .va-button--active) {
  background-color: var(--va-primary);
  color: white;
}

:deep(.pagination-buttons .va-button:not(.va-button--active)) {
  background-color: var(--va-background-element);
  color: var(--va-text-primary);
}

:deep(.pagination-buttons .va-button:hover:not(.va-button--active)) {
  background-color: var(--va-primary-lighten);
}
</style>
