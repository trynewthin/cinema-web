<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { Member } from '../types'
import { validators } from '../../../services/utils'

const props = defineProps({
  member: {
    type: Object as PropType<Member | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: '保存',
  },
})

const defaultNewMember: Member = {
  memberId: '',
  name: '',
  password: '',
  birthday: '',
  sex: 'M',
}

const newMember = ref<Member>({ ...defaultNewMember })

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newMember.value).some((key) => {
    return newMember.value[key as keyof Member] !== (props.member ?? defaultNewMember)[key as keyof Member]
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

watch(
  () => props.member,
  () => {
    if (!props.member) {
      return
    }
    newMember.value = { ...props.member }
  },
  { immediate: true },
)

const form = useForm('add-member-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newMember.value)
  }
}
</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-member-form"
    class="flex-col justify-start items-start gap-4 inline-flex w-full"
  >
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <VaInput v-model="newMember.name" label="姓名" class="w-full" :rules="[validators.required]" name="name" />

      <VaInput
        v-model="newMember.password"
        label="密码"
        type="password"
        class="w-full"
        :rules="[validators.required]"
        name="password"
      />

      <VaInput
        v-model="newMember.birthday"
        label="生日"
        type="date"
        class="w-full"
        :rules="[validators.required]"
        name="birthday"
      />

      <div class="w-full form-field">
        <label class="form-label">性别</label>
        <VaButtonToggle
          v-model="newMember.sex"
          class="w-full sex-toggle"
          :options="[
            { label: '男', value: 'M' },
            { label: '女', value: 'F' },
          ]"
          color="primary"
        />
      </div>

      <div class="flex gap-2 flex-col-reverse sm:flex-row sm:items-center w-full justify-end">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">取消</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>

<style scoped>
.form-field {
  position: relative;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
}

.form-label {
  position: absolute;
  top: -0.75rem;
  left: 0;
  font-size: 0.625rem;
  line-height: 1;
  color: var(--va-primary);
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
}

:deep(.sex-toggle) {
  width: 100%;
  margin-top: 0.25rem;
}

:deep(.sex-toggle .va-button-toggle__button) {
  flex: 1;
  min-width: 120px;
  height: 44px;
  font-size: 0.875rem;
  border: 1px solid var(--va-background-border);
}

:deep(.sex-toggle .va-button-toggle__button--selected) {
  background-color: var(--va-primary);
  color: white;
  border-color: var(--va-primary);
}

:deep(.sex-toggle .va-button-toggle__button:not(.va-button-toggle__button--selected)) {
  background-color: var(--va-background-element);
  color: var(--va-text-primary);
}

:deep(.sex-toggle .va-button-toggle__button:hover:not(.va-button-toggle__button--selected)) {
  background-color: var(--va-background-border);
}
</style>
