import { asyncRouterMap, constantRouterMap } from '@/router'
import { fetchCateList } from '@/api/resource'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(routes, roles) {
  const res = [];

  routes.forEach(route => {
    const tmp = { ...route };
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRouter(tmp.children, roles)
      }
      res.push(tmp)
    }
  });

  return res
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    // 根据角色重置路由
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        let accessedRouters
        if (roles.includes('admin')) {
          accessedRouters = asyncRouterMap
        } else {
          accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
        }
        // 动态获取*资源*路由
        let resourceRoute = accessedRouters.filter((v) => (v.path === '/resource'))[0];
        fetchCateList().then(response => {
          let tempList = response.data;
          // 按照id正序排序
          tempList.sort((a, b) => {
            return a.id - b.id;
          });
          // 数据排序格式化（按id排序后）
          tempList.forEach((v) => {
            v.component = () => import('@/views/resource/hardware');
            v.name = v.pathName;
            v.meta = {
              title: v.pathName
            };
          });
          // 数据树形格式化(按照父子关系)
          tempList.forEach((v) => {
            v.children = [];
            if (v.parentId === 0) {
              resourceRoute.children.unshift(v);
            } else {
              let parent = tempList.find((c) => {
                return c.id === v.parentId;
              });
              parent.children.push(v);
            }
          });
          commit('SET_ROUTERS', accessedRouters);
          resolve()
        });
      })
    }
  }
}

export default permission
