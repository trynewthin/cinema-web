// 菜单通过 navigationRoutes.routes 配置，用于 VaCollapse 组件。每个路由是一个菜单项，使用 VaSidebarItem 组件，可以使用 header 自定义内容。
// 子菜单（即子路由，route.children）用于生成第二层菜单，body 部分包含子菜单项

// 定义接口 INavigationRoute，用于定义导航路由
export interface INavigationRoute {
  name: string // 路由名称
  displayName: string // 路由显示名称
  meta: { icon: string } // 路由元信息，包含图标
  children?: INavigationRoute[] // 子路由
}

// 创建默认对象，包含根路由和路由列表
export default {
  root: {
    name: '/', // 根路由名称
    displayName: 'navigationRoutes.home', // 根路由显示名称
  },
  routes: [
    {
      name: 'dashboard',
      displayName: '仪表盘',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'member-management',
      displayName: '会员管理',
      meta: {
        icon: 'group',
      },
      children: [
        {
          name: 'members',
          displayName: '会员列表',
          meta: {
            icon: 'group',
          },
        },
        {
          name: 'cards',
          displayName: '会员卡管理',
          meta: {
            icon: 'credit_card',
          },
        },
        {
          name: 'care',
          displayName: '会员关怀',
          meta: {
            icon: 'favorite',
          },
        },
      ],
    },
    {
      name: 'TradingRecord',
      displayName: '交易记录',
      meta: {
        icon: 'receipt_long',
      },
    },
    {
      name: 'Movies',
      displayName: '电影管理',
      meta: {
        icon: 'movie',
      },
    },
    {
      name: 'settings',
      displayName: '系统设置',
      meta: {
        icon: 'settings',
      },
    },
  ] as INavigationRoute[],
}
