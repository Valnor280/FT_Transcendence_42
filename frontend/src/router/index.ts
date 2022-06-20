import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import store from '../store'
import { useToast } from "vue-toastification";


const ifAuthenticated = (to : any, from : any, next : any) => {
	const $toast = useToast();
	console.log(!!store.getters.isAuthenticated + 'weew')
	if (store.getters.isAuthenticated) {
	  next()
	  return
	}
	$toast.error('Please log in');
	next('/login')
  }
  
  const ifNotAuthenticated = (to : any, from : any, next : any) => {
	console.log(store.getters.isAuthenticated)
	console.log(store.getters.gettoken)
	if (!store.getters.isAuthenticated) {
	  next()
	  return
	}
	next('/')
  }

  const ifNotBlock = (to : any, from : any, next : any) => {
	const $toast = useToast();
	console.log(!!store.getters.getblock + 'weew')
	if (!store.getters.getblock) {
	  next()
	  return
	}
	$toast.error('Already connected on another window');
	next('/block')
  }

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
	beforeEnter: ifAuthenticated,
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
	//beforeEnter: ifAuthenticated,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/user/:id',
	name: 'user',
	beforeEnter: ifAuthenticated,
    component: () => import(/* webpackChunkName: "user" */ '../views/ProfileView.vue')
  },
  {
    path: '/myuser/',
	name: 'myuser',
	beforeEnter: ifAuthenticated,
    component: () => import(/* webpackChunkName: "myuser" */ '../views/MyProfileView.vue')
  },
  {
    path: '/play',
    name: 'play',
	beforeEnter: ifAuthenticated,
    component: () => import(/* webpackChunkName: "play" */ '../views/PlayView.vue')
  },
  {
    path: '/play/:chall',
    name: 'playchall',
	beforeEnter: ifAuthenticated,
    component: () => import(/* webpackChunkName: "play" */ '../views/PlayView.vue')
  },
//   {
//     path: '/test',
//     name: 'test',
// 	beforeEnter: ifAuthenticated,
//     component: () => import(/* webpackChunkName: "test" */ '../views/testback.vue')
//   },
  {
    path: '/login',
    name: 'login',
	beforeEnter: ifNotAuthenticated,
    component: () => import(/* webpackChunkName: "login" */ '../views/LoginView.vue')
  }, 
  {
	name: 'block',
	path:'/block',
	component: () => import(/* webpackChunkName: "block" */ '../views/BlockView.vue')
  },
  {
	  name: '404',
	  path:'/:pathMatch(.*)*',
	  component: () => import(/* webpackChunkName: "404" */ '../views/404View.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes


})

export default router