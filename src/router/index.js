import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'boot/firebase'
import routes from './routes'
import { useAuthStore } from 'stores/auth'
import { useProjectsStore } from 'stores/projects'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Navigation guard for authentication
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Initialize auth if not already done
    if (!authStore.user && authStore.loading === false) {
      authStore.initAuth()
    }

    // Wait for auth state to be determined
    if (authStore.loading) {
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe()
          resolve()
        })
      })
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
  })

  // Clear current project when navigating away from project pages
  Router.afterEach((to, from) => {
    const projectsStore = useProjectsStore()

    // Clear current project if navigating away from project pages
    if (from.path.startsWith('/project/') && !to.path.startsWith('/project/')) {
      projectsStore.clearCurrentProject()
    }
  })

  return Router
})
