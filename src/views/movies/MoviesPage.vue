<template>
  <h1 class="page-title text-2xl font-bold mb-6">电影管理</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaInput v-model="filters.name" placeholder="搜索电影">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton @click="showAddMovieModal">添加电影</VaButton>
      </div>

      <MoviesTable
        :movies="movies"
        :loading="isLoading"
        :pagination="pagination"
        @editMovie="showEditMovieModal"
        @deleteMovie="onMovieDelete"
        @update:page="onPageChange"
        @update:perPage="onPerPageChange"
        @updatePagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditMovieModal"
    size="small"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">{{ movieToEdit ? '编辑电影' : '添加电影' }}</h1>
    <EditMovieForm
      ref="editFormRef"
      :movie="movieToEdit"
      :save-button-label="movieToEdit ? '保存' : '添加'"
      @close="cancel"
      @save="
        async (movie) => {
          await onMovieSaved(movie)
          ok()
        }
      "
    />
  </VaModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MoviesTable from './widgets/MoviesTable.vue'
import EditMovieForm from './widgets/EditMovieForm.vue'
import { Movie } from './types'
import { useMovies } from './composables/useMovies'
import { useModal, useToast } from 'vuestic-ui'

const { movies, isLoading, filters, pagination, ...moviesApi } = useMovies()

const doShowEditMovieModal = ref(false)
const movieToEdit = ref<Movie | null>(null)
const editFormRef = ref()

const showEditMovieModal = (movie: Movie) => {
  movieToEdit.value = { ...movie }
  doShowEditMovieModal.value = true
}

const showAddMovieModal = () => {
  movieToEdit.value = null
  doShowEditMovieModal.value = true
}

const { init: notify } = useToast()

const onMovieSaved = async (movie: Movie) => {
  try {
    if (movieToEdit.value) {
      await moviesApi.update({
        ...movie,
        movieId: movieToEdit.value.movieId,
        time: movie.releaseDate
      })
      notify({
        message: `电影 ${movie.name} 已更新`,
        color: 'success',
      })
    } else {
      await moviesApi.add({
        ...movie,
        time: movie.releaseDate
      })
      notify({
        message: `电影 ${movie.name} 已创建`,
        color: 'success',
      })
    }
    await moviesApi.fetch()
  } catch (error) {
    console.error('Failed to save movie:', error)
    notify({
      message: '保存失败，请重试',
      color: 'danger',
    })
  }
}

const onMovieDelete = async (movie: Movie) => {
  try {
    await moviesApi.remove(movie)
    notify({
      message: `电影 ${movie.name} 已删除`,
      color: 'success',
    })
    await moviesApi.fetch()
  } catch (error) {
    console.error('Failed to delete movie:', error)
    notify({
      message: '删除失败，请重试',
      color: 'danger',
    })
  }
}

const { confirm } = useModal()

const beforeEditFormModalClose = async (hide: () => unknown) => {
  if (editFormRef.value?.isFormHasUnsavedChanges) {
    const agreed = await confirm({
      maxWidth: '380px',
      message: '表单有未保存的更改，确定要关闭吗？',
      size: 'small',
    })
    if (agreed) {
      hide()
    }
  } else {
    hide()
  }
}

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
</script>
