<template>
  <VaForm
    v-slot="{ isValid }"
    ref="edit-movie-form"
    class="flex-col justify-start items-start gap-4 inline-flex w-full"
  >
    <VaInput v-model="newMovie.name" label="电影名字" class="w-full" :rules="[validators.required]" name="name" />

    <VaInput
      v-model="newMovie.price"
      label="票价"
      type="number"
      class="w-full"
      :rules="[validators.required]"
      name="price"
      placeholder="请输入票价"
    />

    <VaInput
      v-model="newMovie.ticketsSold"
      label="售出票数"
      type="number"
      class="w-full"
      :rules="[validators.required]"
      name="ticketsSold"
      placeholder="请输入售出票数"
    />

    <VaDatePicker
      v-model="formattedTime"
      label="上映时间"
      placeholder="请选择上映时间"
      mode="dateTime"
      format="yyyy-MM-dd HH:mm"
      minute-step="{5}"
      class="w-full"
      :rules="[validators.required]"
      name="time"
      :min="new Date(minDate)"
      :max="new Date(maxDate)"
      @update:modelValue="handleTimeChange"
    />

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

// 添加日期范围限制
const minDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 1)
  return date.toISOString().split('.')[0].slice(0, 16)
})

const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 2)
  return date.toISOString().split('.')[0].slice(0, 16)
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
  time: '', // 初始化为空字符串
}

const newMovie = ref<Movie>({ ...defaultNewMovie })

// 修改时间处理函数
const handleTimeChange = (value: Date | null) => {
  if (!value || isNaN(value.getTime())) {
    return
  }
  // 格式化日期时间
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  // 直接使用用户选择的时间
  const selectedTime = new Date(value)
  newMovie.value.time = selectedTime.toISOString().split('.')[0].replace('T', ' ')
}

// 修改格式化时间计算属性
const formattedTime = computed({
  get: () => {
    if (!newMovie.value.time) return null
    try {
      return new Date(newMovie.value.time)
    } catch {
      return null
    }
  },
  set: (value: Date) => {
    handleTimeChange(value)
  },
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
        time: props.movie.time || getCurrentDateTime(),
      }
    } else {
      newMovie.value = { ...defaultNewMovie }
    }
  },
  { immediate: true },
)

const form = useForm('edit-movie-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', {
      ...newMovie.value,
      price: Number(newMovie.value.price),
      ticketsSold: Number(newMovie.value.ticketsSold),
      time: newMovie.value.time,
    })
  }
}

defineExpose({
  isFormHasUnsavedChanges,
})
</script>
