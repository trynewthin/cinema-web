import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 导入布局组件
import AppLayout from '../layouts/AppLayout.vue'

// 导入会员卡管理组件
import CardsPage from '../views/cards/CardsPage.vue'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  // 路由匹配不到任何路由时重定向到dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: '404' },
  },
  // admin路由
  {
    name: 'admin',
    path: '/',
    component: AppLayout,
    redirect: { name: 'dashboard' },
    meta: {
      requiresAuth: true,
    },
    children: [
      // dashboard路由
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../views/admin/dashboard/index.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      // settings路由
      {
        name: 'settings',
        path: 'settings',
        component: () => import('../views/settings/index.vue'),
        meta: {
          title: '系统设置',
          requiresAuth: true,
        },
      },
      // members路由
      {
        name: 'members',
        path: '/members',
        component: () => import('../views/members/MembersPage.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      // movies路由
      {
        path: '/movies',
        name: 'Movies',
        component: () => import('../views/movies/MoviesPage.vue'),
        meta: {
          requiresAuth: true,
          title: '电影管理',
        },
      },
      // 会员卡管理路由
      {
        path: 'cards',
        name: 'cards',
        component: CardsPage,
        meta: {
          title: '会员卡管理',
        },
      },
      // 交易记录查询路由
      {
        path: '/trading-record',
        name: 'TradingRecord',
        component: () => import('../views/tradingrecord/index.vue'),
        meta: {
          title: '交易记录查询',
          requiresAuth: true,
        },
      },
      // 会员关怀路由
      {
        path: '/care',
        name: 'care',
        component: () => import('../views/care/index.vue'),
        meta: {
          title: '会员关怀',
          requiresAuth: true,
        },
      },
    ],
  },
  // 404路由
  {
    name: '404',
    path: '/404',
    component: () => import('../views/404.vue'),
  },
  // 管理员登录路由
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/login/AdminLogin.vue'),
    meta: {
      title: '管理员登录',
      requiresAuth: false,
    },
  },
]

// 创建路由实例
const router = createRouter({
  // 使用HTML5历史模式
  history: createWebHistory(import.meta.env.BASE_URL),
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  // 路由配置
  routes,
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  // 如果需要登录且未登录，重定向到登录页
  if ((to.meta.requiresAuth || to.path === '/') && !isLoggedIn) {
    next({ name: 'admin-login' })
  } else {
    next()
  }
})

export default router
