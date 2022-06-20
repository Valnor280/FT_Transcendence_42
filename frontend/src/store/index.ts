import { createStore } from 'vuex'
import $axios from '../plugin/axios'
import Vue from 'vue';
import Vuex from "vuex";
import io, { Socket } from 'socket.io-client'

import {
	AUTH_REQUEST,
	AUTH_ERROR,
	AUTH_SUCCESS,
	AUTH_LOGOUT,
	AUTH_REGISTER,
	BLOCK
  } from "./auth";
import $socket from '@/plugin/socket';


export default createStore({
  state: {
	token: localStorage.getItem('user-token') || '',
	status: '',
	block: false,
  },
  getters: {
	isAuthenticated: state => {
		return !!state.token;
	},
	authStatus: state => state.status,
	gettoken: state => state.token,
	getblock: state => state.block,
  },
  mutations: {
	[AUTH_REQUEST]: (state) => {
		state.status = 'loading'
	  },
	  [AUTH_SUCCESS]: (state, token) => {
		state.status = 'success'
		state.token = token
	  },
	  [AUTH_ERROR]: (state) => {
		state.status = 'error'
	  },
	  [AUTH_REGISTER]: (state) => {
		  state.status = 'registerd'
	  },
	[AUTH_LOGOUT]: (state, token) => {
		state.status = 'logged out'
		state.token = ""
	},
	[BLOCK]: (state) => {
		state.block = !state.block
	}
  },
  actions: {
	[AUTH_REGISTER]: ({commit, dispatch}, user) => {
        return new Promise(async (resolve, reject) => {
            commit(AUTH_REGISTER)
            $axios({url: '/api/account/create', data: user, method: 'POST'})
            .then(resp => {
				console.log(resp)

				$axios({url: '/api/auth/login', data: user, method: 'POST', withCredentials: true})
				.then(resp => {
					const token = resp.data.access_token;
					$axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
					$socket.io.opts.extraHeaders = {'Authorization': token};
					// Add the following line:
					
					commit(AUTH_SUCCESS, token)
					//dispatch(U)
					resolve(resp)
					localStorage.setItem('user-token', token)
				})
				.catch(err => {
					commit(AUTH_ERROR, err)
					localStorage.removeItem('user-token')
					reject(err)
				})
				console.log(user);
            })
            .catch(err => {
                commit(AUTH_ERROR, err)
                localStorage.removeItem('user-token')
                reject(err)
            })
        })
    },
	[AUTH_REQUEST]: ({commit, dispatch}, user) => {
        return new Promise((resolve, reject) => {
            commit(AUTH_REQUEST)
			console.log(user);
            $axios({url: '/api/auth/login42', data: user, method: 'POST' })
            .then(resp => {
                const token = resp.data.access_token;
                localStorage.setItem('signin', resp.data.sign_in);
				console.log(resp + 'dlo');
                $axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
                $socket.io.opts.extraHeaders = {'Authorization': token};

				if(!!resp.data.access_token)
				{
					console.log('testtttt', resp.data.access_token)
                	localStorage.setItem('user-token', token);
				}
				$socket.disconnect().connect()
				commit(AUTH_SUCCESS, token);
                //dispatch(U)
                resolve(resp)
            })
            .catch(err => {
                commit(AUTH_ERROR, err)
                localStorage.removeItem('user-token')
                reject(err)
            })
			
        })
    },
	[AUTH_LOGOUT]: ({ commit }) => {
		return new Promise(resolve => {
		  commit(AUTH_LOGOUT);
		  localStorage.removeItem("user-token");
		  resolve(localStorage.removeItem("user-token"));
		});
	  },
	[BLOCK]: ({ commit }) => {
		commit(BLOCK);
	}
  },
  modules: {
  }
})
