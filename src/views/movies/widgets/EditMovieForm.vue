<template>
  <VaForm
    v-slot="{ isValid }"
    ref="edit-movie-form"
    class="flex-col justify-start items-start gap-4 inline-flex w-full"
  >
    <!-- 电影名字 -->
    <div class="form-field w-full">
      <h3 class="field-label">电影名字</h3>
      <VaInput 
        v-model="newMovie.name" 
        class="w-full" 
        :rules="[validators.required]" 
        name="name"
        placeholder="请输入电影名字"
      />
    </div>

    <!-- 票价 -->
    <div class="form-field w-full">
      <h3 class="field-label">票价</h3>
      <VaInput
        v-model="newMovie.price"
        type="number"
        class="w-full"
        :rules="[validators.required]"
        name="price"
        placeholder="请输入票价"
      />
    </div>

    <!-- 售出票数 -->
    <div class="form-field w-full">
      <h3 class="field-label">售出票数</h3>
      <VaInput
        v-model="newMovie.ticketsSold"
        type="number"
        class="w-full"
        :rules="[validators.required]"
        name="ticketsSold"
        placeholder="请输入售出票数"
      />
    </div>

    <!-- 最后编辑时间 -->
    <div class="form-field w-full">
      <h3 class="field-label">最后编辑时间</h3>
      <VaInput
        v-model="formattedDisplayTime"
        class="w-full"
        :rules="[validators.required]"
        name="time"
        placeholder="格式：YYYY-MM-DD HH:mm:ss"
        @input="handleTimeInput"
      >
        <template #appendInner>
          <VaIcon name="access_time" />
        </template>
      </VaInput>
      <span class="time-hint text-xs text-gray-500">
        请按格式输入时间，例如：2024-01-16 14:30:00
      </span>
    </div>

    <!-- 按钮区域 -->
    <div class="flex gap-2 flex-col-reverse sm:flex-row sm:items-center w-full justify-end">
      <VaButton preset="secondary" color="secondary" @click="$emit('close')">取消</VaButton>
      <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
    </div>
  </VaForm>
</template>

<script setup lang="ts">
import { PropType, ref, computed, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { Movie } from '../types'
import { validators } from '../../../services/utils'

const props = defineProps({
  movie: {
    type: Object as PropType<Movie | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: '保存',
  },
})

// 修改日期范围限制
const minDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 5) // 可以选择过去5年的时间
  return date.toISOString().split('.')[0].slice(0, 16)
})

const maxDate = computed(() => {
  const date = new Date()
  return date.toISOString().split('.')[0].slice(0, 16) // 最大时间为当前时间
})

// 获取当前日期时间作为默认值
const getCurrentDateTime = () => {
  const now = new Date()
  // 将分钟向上取整到最近的5分钟
  const minutes = Math.ceil(now.getMinutes() / 5) * 5
  now.setMinutes(minutes)
  now.setSeconds(0)
  now.setMilliseconds(0)
  return now.toISOString().split('.')[0].slice(0, 16)
}

const defaultNewMovie: Movie = {
  movieId: '',
  name: '',
  price: 0,
  ticketsSold: 0,
  releaseDate: getCurrentDateTime()
}

const newMovie = ref<Movie>({ ...defaultNewMovie })

// 修改时间处理函数
const handleTimeInput = (value: string) => {
  // 验证时间格式
  const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
  if (!timeRegex.test(value)) {
    return
  }

  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return
    }
    newMovie.value.releaseDate = value
  } catch (error) {
    console.error('Invalid date format:', error)
  }
}

// 修改格式化显示时间的计算属性
const formattedDisplayTime = computed({
  get: () => {
    if (!newMovie.value.releaseDate) return ''
    try {
      const date = new Date(newMovie.value.releaseDate)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } catch {
      return ''
    }
  },
  set: (value: string) => {
    handleTimeInput(value)
  }
})

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newMovie.value).some((key) => {
    return newMovie.value[key as keyof Movie] !== (props.movie ?? defaultNewMovie)[key as keyof Movie]
  })
})

watch(
  () => props.movie,
  () => {
    if (props.movie) {
      newMovie.value = {
        ...props.movie,
        releaseDate: props.movie.releaseDate || getCurrentDateTime()
      }
    } else {
      newMovie.value = { ...defaultNewMovie }
    }
  },
  { immediate: true }
)

const form = useForm('edit-movie-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', {
      ...newMovie.value,
      price: Number(newMovie.value.price),
      ticketsSold: Number(newMovie.value.ticketsSold),
      releaseDate: newMovie.value.releaseDate
    })
  }
}

defineExpose({
  isFormHasUnsavedChanges,
})
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

.time-display-box {
  background-color: var(--va-background-primary);
  border: 1px solid var(--va-border);
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.time-display-box:hover {
  border-color: var(--va-primary);
}

/* 移除 VaInput 的默认 label */
:deep(.va-input__label) {
  display: none;
}

.time-hint {
  margin-top: 0.25rem;
  color: var(--va-text-secondary);
}
</style>
