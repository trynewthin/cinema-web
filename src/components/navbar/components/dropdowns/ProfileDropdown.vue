<template>
  <div class="profile-dropdown-wrapper">
    <VaDropdown v-model="isShown" :offset="[9, 0]" class="profile-dropdown" stick-to-edges>
      <template #anchor>
        <VaButton preset="secondary" color="textPrimary">
          <span class="profile-dropdown__anchor min-w-max">
            <VaIcon name="face" color="primary" :size="32" />
          </span>
        </VaButton>
      </template>
      <VaDropdownContent
        class="profile-dropdown__content md:w-60 px-0 py-4 w-full"
        :style="{ '--hover-color': hoverColor }"
      >
        <VaList v-for="group in options" :key="group.name">
          <VaListItem
            v-for="item in group.list"
            :key="item.name"
            class="menu-item px-4 text-base cursor-pointer h-8"
            v-bind="resolveLinkAttribute(item)"
          >
            <VaIcon :name="item.icon" class="pr-1" color="secondary" />
            {{ t(`user.${item.name}`) }}
          </VaListItem>
          <VaListSeparator v-if="group.separator" class="mx-3 my-2" />
        </VaList>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'
import { useRouter } from 'vue-router'

const { colors, setHSLAColor } = useColors()
const hoverColor = computed(() => setHSLAColor(colors.focus, { a: 0.1 }))
const router = useRouter()

const { t } = useI18n()
const isShown = ref(false)

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/admin/login')
}

const options = [
  {
    name: '',
    separator: true,
    list: [
      {
        name: 'settings',
        to: 'settings',
        icon: 'mso-settings',
      },
    ],
  },
  {
    name: '',
    separator: false,
    list: [
      {
        name: 'logout',
        onClick: handleLogout,
        icon: 'mso-logout',
      },
    ],
  },
]

const resolveLinkAttribute = (item: any) => {
  if (item.to) return { to: { name: item.to } }
  if (item.href) return { href: item.href, target: '_blank' }
  if (item.onClick) return { onClick: item.onClick }
  return {}
}
</script>

<style lang="scss">
.profile-dropdown {
  cursor: pointer;

  &__content {
    .menu-item:hover {
      background: var(--hover-color);
    }
  }

  &__anchor {
    display: inline-block;
  }
}
</style>
