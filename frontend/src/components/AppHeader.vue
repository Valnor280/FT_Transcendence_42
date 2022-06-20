<template>
  <header>
    <img alt="logo" src="../assets/pixel-placer.svg" height="100">
    <p>Pongminator 3000</p>
    <nav>
        <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link :to="{name: 'play'}" :key="$route.fullPath">Play</router-link></li>
            <li><router-link :to="{name: 'myuser'}">User</router-link></li>
            <li><router-link :to="{name: 'about'}">About</router-link></li>
			<!-- <li><router-link :to="{name: 'test'}">test</router-link></li> -->
			<li v-if="auth == false"><router-link :to="{name: 'login'}">login</router-link></li>
			<li v-else-if="auth = true"><button class="button-24" v-on:click="logout">logout</button></li>
        </ul>
		
    </nav>
  </header>
</template>

<script lang="ts">

import { AUTH_LOGOUT } from '@/store/auth';
import { defineComponent } from 'vue';
import store from '../store';
import $axios from '@/plugin/axios';
import { useToast } from 'vue-toastification';

export default defineComponent({
	name: 'Header',
	data(): unknown {
		return {
			auth: !!store.getters.isAuthenticated,
		}
	},
	methods: {
		islogged() {
			let mv : any = this;
			mv.auth = !!store.getters.isAuthenticated;
		},
		logout() {
			const toast = useToast();
			store.dispatch(AUTH_LOGOUT).then(() => {
      		this.$router.push('/login')
			toast.success('Goodbye my love ! Goodbye my life !')
    	})
		}
	},
	computed: {
    count () {
		console.log('bool ' + !!store.getters.isAuthenticated);
      return !!store.getters.isAuthenticated;
    },
  },
  watch: {
    count (newCount : any, oldCount : any) {
		let mv: any = this;
		mv.auth = newCount;
		console.log('lol');
		console.log(mv.auth);
    }
  }
})
</script>

<style lang="scss" scoped>
    header {
        display: flex;
        border-bottom: 1px solid #ccc;
        padding: .5rem 1rem;

        p {
            font-size: 32px;
            margin-left: 1 rem;
        }
		background: url(../assets/blackspace.jpeg);
		color: gold;
    }

    nav {
        margin-left: auto;

        ul {
            list-style: none;
        }

        ul li {
            //font-style: "Open Sans Light";
            font-size: 26px;
            display: inline-flex;
            margin-left: 5rem;
        }
    }

.button-24 {
  background: #FF4742;
  border: 1px solid #FF4742;
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 2px 4px;
  box-sizing: border-box;
  color: #FFFFFF;
  cursor: pointer;
  display: inline-block;
  font-family: nunito,roboto,proxima-nova,"proxima nova",sans-serif;
  font-size: 16px;
  font-weight: 800;
  line-height: 16px;
  min-height: 40px;
  outline: 0;
  padding: 12px 14px;
  text-align: center;
  text-rendering: geometricprecision;
  text-transform: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
}

.button-24:hover,
.button-24:active {
  background-color: initial;
  background-position: 0 0;
  color: #FF4742;
}

.button-24:active {
  opacity: .5;
}
</style>
