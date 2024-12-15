<template>
  <!-- ʹ��VaSidebar�������writableVisible���������ÿ���ΪsidebarWidth����ɫΪcolor����С����Ϊ0 -->
  <VaSidebar v-model="writableVisible" :width="sidebarWidth" :color="color" minimized-width="0">
    <!-- ʹ��VaAccordion�������value������������ѡ -->
    <VaAccordion v-model="value" multiple>
      <!-- ʹ��VaCollapse���������navigationRoutes.routes���飬��index���� -->
      <VaCollapse v-for="(route, index) in navigationRoutes.routes" :key="index">
        <!-- ʹ�ò��header����isCollapsed���� -->
        <template #header="{ value: isCollapsed }">
          <!-- ʹ��VaSidebarItem���������to���ԣ�active���ԣ�active-color���ԣ�text-color���ԣ�aria-label���ԣ�role���ԣ�hover-opacity���� -->
          <VaSidebarItem
            :to="route.children ? undefined : { name: route.name }"
            :active="routeHasActiveChild(route)"
            :active-color="activeColor"
            :text-color="textColor(route)"
            :aria-label="`${route.children ? 'Open category ' : 'Visit'} ${t(route.displayName)}`"
            role="button"
            hover-opacity="0.10"
          >
            <!-- ʹ��VaSidebarItemContent���������class���� -->
            <VaSidebarItemContent class="py-3 pr-2 pl-4">
              <!-- ʹ��VaIcon���������aria-hidden���ԣ�name���ԣ�size���ԣ�color���� -->
              <VaIcon
                v-if="route.meta.icon"
                aria-hidden="true"
                :name="route.meta.icon"
                size="20px"
                :color="iconColor(route)"
              />
              <!-- ʹ��VaSidebarItemTitle���������class���� -->
              <VaSidebarItemTitle class="flex justify-between items-center leading-5 font-semibold">
                {{ t(route.displayName) }}
                <!-- ʹ��VaIcon���������name���ԣ�size���� -->
                <VaIcon v-if="route.children" :name="arrowDirection(isCollapsed)" size="20px" />
              </VaSidebarItemTitle>
            </VaSidebarItemContent>
          </VaSidebarItem>
        </template>
        <!-- ʹ�ò��body -->
        <template #body>
          <!-- ����route.children���飬��index2���� -->
          <div v-for="(childRoute, index2) in route.children" :key="index2">
            <!-- ʹ��VaSidebarItem���������to���ԣ�active���ԣ�active-color���ԣ�text-color���ԣ�aria-label���ԣ�hover-opacity���� -->
            <VaSidebarItem
              :to="{ name: childRoute.name }"
              :active="isActiveChildRoute(childRoute)"
              :active-color="activeColor"
              :text-color="textColor(childRoute)"
              :aria-label="`Visit ${t(route.displayName)}`"
              hover-opacity="0.10"
            >
              <!-- ʹ��VaSidebarItemContent���������class���� -->
              <VaSidebarItemContent class="py-3 pr-2 pl-11">
                <!-- ʹ��VaSidebarItemTitle���������class���� -->
                <VaSidebarItemTitle class="leading-5 font-semibold">
                  {{ t(childRoute.displayName) }}
                </VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
          </div>
        </template>
      </VaCollapse>
    </VaAccordion>
  </VaSidebar>
</template>
<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'

import navigationRoutes, { type INavigationRoute } from './NavigationRoutes'

export default defineComponent({
  name: 'Sidebar',
  props: {
    // ����visible���ԣ�����ΪBoolean��Ĭ��ֵΪtrue
    visible: { type: Boolean, default: true },
    // ����mobile���ԣ�����ΪBoolean��Ĭ��ֵΪfalse
    mobile: { type: Boolean, default: false },
  },
  emits: ['update:visible'],

  setup: (props, { emit }) => {
    // ʹ��useColors��ȡ��ɫ
    const { getColor, colorToRgba } = useColors()
    // ʹ��useRoute��ȡ·��
    const route = useRoute()
    // ʹ��useI18n��ȡ���ʻ�
    const { t } = useI18n()

    // ����value����������Ϊboolean����
    const value = ref<boolean[]>([])

    // ����writableVisible����������Ϊcomputed����ȡprops.visible������emit('update:visible', v)
    const writableVisible = computed({
      get: () => props.visible,
      set: (v: boolean) => emit('update:visible', v),
    })

    // ����isActiveChildRoute�������ж�child�Ƿ�Ϊ��ǰ·��
    const isActiveChildRoute = (child: INavigationRoute) => route.name === child.name

    // ����routeHasActiveChild�������ж�section�Ƿ��е�ǰ·��
    const routeHasActiveChild = (section: INavigationRoute) => {
      if (!section.children) {
        return route.path.endsWith(`${section.name}`)
      }

      return section.children.some(({ name }) => route.path.endsWith(`${name}`))
    }

    // ����setActiveExpand����������valueֵΪnavigationRoutes.routes.map(routeHasActiveChild)
    const setActiveExpand = () =>
      (value.value = navigationRoutes.routes.map((route: INavigationRoute) => routeHasActiveChild(route)))

    // ����sidebarWidth����������Ϊcomputed����ȡprops.mobile���жϷ���'100vw'��'280px'
    const sidebarWidth = computed(() => (props.mobile ? '100vw' : '280px'))
    // ����color����������Ϊcomputed����ȡgetColor('background-secondary')
    const color = computed(() => getColor('background-secondary'))
    // ����activeColor����������Ϊcomputed����ȡcolorToRgba(getColor('focus'), 0.1)
    const activeColor = computed(() => colorToRgba(getColor('focus'), 0.1))

    // ����iconColor�������ж�route�Ƿ��е�ǰ·�ɣ�����'primary'��'secondary'
    const iconColor = (route: INavigationRoute) => (routeHasActiveChild(route) ? 'primary' : 'secondary')
    // ����textColor�������ж�route�Ƿ��е�ǰ·�ɣ�����'primary'��'textPrimary'
    const textColor = (route: INavigationRoute) => (routeHasActiveChild(route) ? 'primary' : 'textPrimary')
    // ����arrowDirection�������ж�state�Ƿ�Ϊtrue������'va-arrow-up'��'va-arrow-down'
    const arrowDirection = (state: boolean) => (state ? 'va-arrow-up' : 'va-arrow-down')

    // ����route.fullPath������setActiveExpand����
    watch(() => route.fullPath, setActiveExpand, { immediate: true })

    return {
      writableVisible,
      sidebarWidth,
      value,
      color,
      activeColor,
      navigationRoutes,
      routeHasActiveChild,
      isActiveChildRoute,
      t,
      iconColor,
      textColor,
      arrowDirection,
    }
  },
})
</script>
