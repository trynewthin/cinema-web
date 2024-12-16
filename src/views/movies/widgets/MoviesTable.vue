<template>
  <VaDataTable :columns="columns" :items="movies" :loading="loading" class="movies-table">
    <template #cell(price)="{ rowData }"> ¥{{ Number(rowData.price).toFixed(2) }} </template>
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-center">
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          aria-label="编辑电影"
          @click="$emit('editMovie', rowData as Movie)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="删除电影"
          @click="onMovieDelete(rowData as Movie)"
        />
      </div>
    </template>
    <template #cell(time)="{ value }">
      {{ formatDateTime(value) }}
    </template>
  </VaDataTable>

  <!-- 分页控制 -->
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

<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Movie } from '../types'
import { PropType, computed } from 'vue'

const columns = defineVaDataTableColumns([
  { label: '电影ID', key: 'movieId', sortable: true, align: 'center' },
  { label: '电影名字', key: 'name', sortable: true, align: 'center' },
  { label: '票价', key: 'price', sortable: true, align: 'center' },
  { label: '售出票数', key: 'ticketsSold', sortable: true, align: 'center' },
  { label: '最后编辑时间', key: 'releaseDate', sortable: true, align: 'center' },
  { label: '操作', key: 'actions', align: 'center' },
])

const props = defineProps({
  movies: {
    type: Array as PropType<Movie[]>,
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
  (event: 'editMovie', movie: Movie): void
  (event: 'deleteMovie', movie: Movie): void
  (event: 'update:page', page: number): void
  (event: 'update:perPage', perPage: number): void
  (event: 'updatePagination', pagination: { page: number; perPage: number; total: number }): void
}>()

const { confirm } = useModal()

const onMovieDelete = async (movie: Movie) => {
  const agreed = await confirm({
    title: '删除电影',
    message: `确定要删除电影 ${movie.name} 吗？`,
    okText: '删除',
    cancelText: '取消',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('deleteMovie', movie)
  }
}

// 计算总页数
const totalPages = computed(() => {
  const total = props.pagination.total
  const perPage = props.pagination.perPage
  return total ? Math.ceil(total / perPage) : 0
})

// 更新页码
const updatePage = (newPage: number) => {
  emit('updatePagination', { ...props.pagination, page: newPage })
}

// 更新每页显示数量
const updatePerPage = (newPerPage: number) => {
  emit('updatePagination', { ...props.pagination, perPage: newPerPage })
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0',
  )} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.movies-table :deep(.va-data-table__table-td) {
  vertical-align: middle;
}

.movies-table :deep(.va-data-table__table-th) {
  text-align: center;
}

.movies-table :deep(.va-data-table__table-td) {
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
