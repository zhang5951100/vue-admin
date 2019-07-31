import { constantRoutes } from '@/router'
/* Layout */
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
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
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes: function({ commit }, sysRoutes) {
    return new Promise(resolve => {
      const routes = []
      // 拼装路由
      for (let i = 0; i < sysRoutes.length; i++) {
        debugger
        const route = {}
        if (sysRoutes[i].path) {
          route['path'] = sysRoutes[i].path
        }
        if (sysRoutes[i].name) {
          route['name'] = sysRoutes[i].name
        }
        if (sysRoutes[i].redirect) {
          route['redirect'] = sysRoutes[i].redirect
        }
        if (sysRoutes[i].meta) {
          route['meta'] = sysRoutes[i].meta
        }
        if (sysRoutes[i].children) {
          const children = sysRoutes[i].children
          const childrenResult = []
          for (let j = 0; j < children.length; j++) {
            const child = {}
            if (children[j].path) {
              child['path'] = children[j].path
            }
            if (children[j].name) {
              child['name'] = children[j].name
            }
            if (children[j].redirect) {
              child['redirect'] = children[j].redirect
            }
            if (children[j].meta) {
              child['meta'] = children[j].meta
            }
            if (children[j].component) {
              child['component'] = () => import(`@/views/${children[j].component}`)
            }
            childrenResult.push(child)
          }
          route['children'] = childrenResult
        }
        route['component'] = Layout
        routes.push(route)
      }
      commit('SET_ROUTES', routes)
      console.log(routes)
      resolve(routes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
