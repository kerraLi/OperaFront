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

/**
 * name:'router-name'             路由名称！必须设置！
 * meta : {
    title: 'title'                标题名称！必须设置！（菜单权限根据此生成）
  }
 * @type {*[]}
 */
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
    name: 'Ali',
    meta: {
      title: 'Ali',
      icon: 'ali',
    },
    children: [
      {
        path: 'account/list',
        component: () => import('@/views/ali/account/list'),
        name: 'AliAccountList',
        meta: {
          title: 'AccountList',
        }
      },
      {
        path: 'ecs/list',
        component: () => import('@/views/ali/ecs/list'),
        name: 'AliEcsList',
        meta: {
          title: 'EcsList',
        }
      },
      // {
      //   path: 'ecs/buy',
      //   component: () => import('@/views/ali/ecs/buy'),
      //   name: 'AliEcsBuy',
      //   meta: {
      //     title: 'EcsBuy',
      //   }
      // },
      {
        path: 'cdn/list',
        component: () => import('@/views/ali/cdn/list'),
        name: 'AliCdnList',
        meta: {
          title: 'CdnList',
        }
      },
      {
        path: 'cdn/refresh',
        component: () => import('@/views/ali/cdn/refresh'),
        name: 'AliCdnRefresh',
        meta: {
          title: 'CdnRefresh',
        }
      },
      {
        path: 'scdn/list',
        component: () => import('@/views/ali/scdn/list'),
        name: 'ScdnList',
        meta: {
          title: 'ScdnList',
        }
      },
      {
        path: 'scdn/refresh',
        component: () => import('@/views/ali/scdn/refresh'),
        name: 'ScdnRefresh',
        meta: {
          title: 'ScdnRefresh',
        }
      },
    ]
  },
  {
    path: '/go',
    component: Layout,
    redirect: '/go/index',
    name: 'Godaddy',
    meta: {
      title: 'Godaddy',
      icon: 'guide',
    },
    children: [
      {
        path: 'account/list',
        component: () => import('@/views/go/account/list'),
        name: 'GoAccountList',
        meta: {
          title: 'AccountList',
        }
      },
      {
        path: 'domain/list',
        component: () => import('@/views/go/domain/list'),
        name: 'GoDomainList',
        meta: {
          title: 'DomainList',
        }
      },
      {
        path: 'certificate/list',
        component: () => import('@/views/go/certificate/list'),
        name: 'GoCertificateList',
        meta: {
          title: 'CertificateList',
        }
      }
    ]

  },
  {
    path: '/aws',
    component: Layout,
    redirect: '/aws/index',
    name: 'Aws',
    meta: {
      title: 'Aws',
      icon: 'aws',
    },
    children: [
      {
        path: 'account/list',
        component: () => import('@/views/aws/account/list'),
        name: 'AwsAccountList',
        meta: {
          title: 'AccountList',
        }
      },
      {
        path: 'ec2/list',
        component: () => import('@/views/aws/ec2/list'),
        name: 'AwsEc2List',
        meta: {
          title: 'Ec2List',
        }
      },
    ]
  },
  resourceRouter,
  {
    path: '/monitor',
    component: Layout,
    redirect: '/monitor/index',
    name: 'Monitor',
    meta: {
      title: 'Monitor',
      icon: 'monitor',
    },
    children: [
      {
        path: 'time/point',
        component: () => import('@/views/monitor/time/point'),
        name: 'TimeMonitorPoint',
        meta: {
          title: 'TimeMonitorPoint',
        }
      },
      {
        path: 'domain/point',
        component: () => import('@/views/monitor/domain/point'),
        name: 'DomainMonitorPoint',
        meta: {
          title: 'DomainMonitorPoint',
        }
      },
      {
        path: 'domain/domain',
        component: () => import('@/views/monitor/domain/domain'),
        name: 'DomainMonitorDomain',
        meta: {
          title: 'DomainMonitorDomain',
        }
      },
      {
        path: 'domain/index',
        component: () => import('@/views/monitor/domain/monitor'),
        name: 'DomainMonitorIndex',
        meta: {
          title: 'DomainMonitorIndex',
        }
      },
      {
        path: 'domain/speed',
        component: () => import('@/views/monitor/domain/speed'),
        name: 'DomainSpeedTest',
        meta: {
          title: 'DomainSpeedTest',
        }
      }
    ]
  },
  {
    path: '/config',
    component: Layout,
    redirect: '/config/index',
    name: 'Config',
    meta: {
      title: 'ConfigManage',
      icon: 'international',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/config/serverInfo'),
        name: 'ConfigIndex',
        meta: {
          title: 'ConfigManage',
        }
      },
      {
        path: 'upload',
        component: () => import('@/views/config/uploadConfig'),
        name: 'ConfigUpload',
        meta: {
          title: 'ConfigUpload',
        }
      },
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    name: 'User',
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
    name: 'System',
    meta: {
      title: 'System',
      icon: 'setting',
    },
    children: [
      {
        path: 'parameter',
        component: () => import('@/views/system/parameter/index'),
        name: 'Parameter',
        meta: {
          title: 'Parameter',
        }
      },
      {
        path: 'log/handle',
        component: () => import('@/views/system/log/handle'),
        name: 'LogHandle',
        meta: {
          title: 'LogHandle',
        }
      },
      {
        path: 'data',
        component: () => import('@/views/system/refresh'),
        name: 'DataRefresh',
        meta: {
          title: 'DataRefresh',
        }
      }
    ]
  },

  /** When your routing table is too long, you can split it into small modules**/
  { path: '*', redirect: '/404', hidden: true }
]
