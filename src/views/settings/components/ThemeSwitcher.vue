<template>
  <VaButtonToggle v-model="theme" color="background-element" border-color="background-element" :options="options" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useColors } from 'vuestic-ui'

const { applyPreset, currentPresetName } = useColors()

const theme = computed({
  get() {
    return currentPresetName.value
  },
  set(value) {
    applyPreset(value)
  },
})

const options = [
  { label: '深色', value: 'dark' },
  { label: '浅色', value: 'light' },
]
</script>
