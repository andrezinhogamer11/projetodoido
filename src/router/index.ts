import { createRouter, createWebHistory } from '@ionic/vue-router'

import { supabase } from '../lib/supabase'
import CadastroPage from '../views/CadastroPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import LancamentosPage from '../views/LancamentosPage.vue'
import LoginPage from '../views/LoginPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: LoginPage,
    meta: {
      publico: true
    }
  },
  {
    path: '/cadastro',
    component: CadastroPage,
    meta: {
      publico: true
    }
  },
  {
    path: '/dashboard',
    component: DashboardPage
  },
  {
    path: '/lancamentos',
    component: LancamentosPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  const usuarioLogado = !!data.session

  if (!to.meta.publico && !usuarioLogado) {
    return '/login'
  }

  if (to.meta.publico && usuarioLogado) {
    return '/dashboard'
  }

  return true
})

export default router
