import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home'
import Main from '../views/Main'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/:id',
    name: 'main',
    props: true,
    component: Main
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
