import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

/* Router Modules */
import resourceRouter from './modules/resource'

/** note: Submenu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if true, the page will no be cached(default is false)
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
  }
 **/
export const constantRouterMap = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard' }
      }
    ]
  }
];

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/message',
    component: Layout,
    redirect: '/message/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/message/index'),
        name: 'Message',
        meta: { title: 'Message', icon: 'message' }
      }
    ]
  },
  {
    path: '/ali',
    component: Layout,
    redirect: '/ali/index',
    meta: {
      title: 'Ali',
      icon: 'ali',
      roles: ['admin']
    },
    children: [
      {
        path: 'account/list',
        component: () => import('@/views/ali/account/list'),
        meta: {
          title: 'AccountList',
          roles: ['admin']
        }
      },
      {
        path: 'ecs/list',
        component: () => import('@/views/ali/ecs/list'),
        name: 'EcsList',
        meta: {
          title: 'EcsList',
          roles: ['admin']
        }
      },
      // {
      //   path: 'ecs/buy',
      //   component: () => import('@/views/ali/ecs/buy'),
      //   name: 'EcsBuy',
      //   meta: {
      //     title: 'EcsBuy',
      //     roles: ['admin']
      //   }
      // },
      {
        path: 'cdn/list',
        component: () => import('@/views/ali/cdn/list'),
        name: 'CdnList',
        meta: {
          title: 'CdnList',
          roles: ['admin']
        }
      },
      {
        path: 'cdn/refresh',
        component: () => import('@/views/ali/cdn/refresh'),
        name: 'CdnRefresh',
        meta: {
          title: 'CdnRefresh',
          roles: ['admin']
        }
      }
    ]

  },
  {
    path: '/go',
    component: Layout,
    redirect: '/go/index',
    meta: {
      title: 'Godaddy',
      icon: 'guide',
      roles: ['admin']
    },
    children: [
      {
        path: 'account/list',
        component: () => import('@/views/go/account/list'),
        meta: {
          title: 'AccountList',
          roles: ['admin']
        }
      },
      {
        path: 'domain/list',
        component: () => import('@/views/go/domain/list'),
        name: 'DomainList',
        meta: {
          title: 'DomainList',
          roles: ['admin']
        }
      },
      {
        path: 'certificate/list',
        component: () => import('@/views/go/certificate/list'),
        name: 'CertificateList',
        meta: {
          title: 'CertificateList',
          roles: ['admin']
        }
      }
    ]

  },
  {
    path: '/aws',
    component: Layout,
    redirect: '/aws/index',
    meta: {
      title: 'Aws',
      icon: 'aws',
      roles: ['admin']
    },
    children: [
      {
        path: 'account/list',
        component: () => import('@/views/aws/account/list'),
        meta: {
          title: 'AccountList',
          roles: ['admin']
        }
      },
      {
        path: 'ec2/list',
        component: () => import('@/views/aws/ec2/list'),
        name: 'Ec2List',
        meta: {
          title: 'Ec2List',
          roles: ['admin']
        }
      },
    ]
  },
  resourceRouter,
  {
    path: '/monitor',
    component: Layout,
    redirect: '/monitor/index',
    meta: {
      title: 'Monitor',
      icon: 'monitor',
    },
    children: [
      {
        path: 'point',
        component: () => import('@/views/monitor/point'),
        name: 'MonitorPoint',
        meta: {
          title: 'MonitorPoint',
        }
      },
      {
        path: 'domain',
        component: () => import('@/views/monitor/domain'),
        name: 'MonitorDomain',
        meta: {
          title: 'MonitorDomain',
        }
      },
      {
        path: 'index',
        component: () => import('@/views/monitor/monitor'),
        name: 'MonitorIndex',
        meta: {
          title: 'MonitorIndex',
        }
      },
      {
        path: 'speed',
        component: () => import('@/views/monitor/speed'),
        name: 'SpeedTest',
        meta: {
          title: 'SpeedTest',
        }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    meta: {
      title: 'User',
      icon: 'user',
    },
    children: [
      {
        path: 'reset/pwd',
        component: () => import('@/views/user/password/reset'),
        name: 'PasswordReset',
        meta: {
          title: 'PasswordReset'
        }
      },
      {
        path: 'permission',
        component: () => import('@/views/user/permission'),
        name: 'UserPermission',
        meta: {
          title: 'UserPermission',
        }
      },
      {
        path: 'role',
        component: () => import('@/views/user/role'),
        name: 'UserRole',
        meta: {
          title: 'UserRole',
        }
      },
      {
        path: 'index',// 用户管理
        component: () => import('@/views/user/index'),
        name: 'UserIndex',
        meta: {
          title: 'UserIndex',
        }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/index',
    meta: {
      title: 'System',
      icon: 'setting',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'parameter',
        component: () => import('@/views/system/parameter/index'),
        name: 'Parameter',
        meta: {
          title: 'Parameter',
          roles: ['admin']
        }
      },
      {
        path: 'log/handle',
        component: () => import('@/views/system/log/handle'),
        name: 'LogHandle',
        meta: {
          title: 'LogHandle',
          roles: ['admin']
        }
      }
    ]
  },

  /** When your routing table is too long, you can split it into small modules**/
  { path: '*', redirect: '/404', hidden: true }
]
