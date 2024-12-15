<template>
  <div class="app-navbar-actions">
    <ProfileDropdown class="app-navbar-actions__item app-navbar-actions__item--profile mr-1" />
  </div>
</template>

<script lang="ts" setup>
import ProfileDropdown from './dropdowns/ProfileDropdown.vue'

defineProps({
  isMobile: { type: Boolean, default: false },
})
</script>

<style lang="scss">
.app-navbar-actions {
  display: flex;
  align-items: center;

  &__item {
    padding: 0;
    margin-left: 0.25rem;
    margin-right: 0.25rem;

    &--profile {
      display: flex;
      justify-content: center;
    }

    @media screen and (max-width: 640px) {
      margin-left: 0;
      margin-right: 0;
    }
  }
}
</style>
