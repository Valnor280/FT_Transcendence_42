<template>
  <div class="profile">
		<div class="left">
			<div class="picture">
            <img :src="user.picture" alt="avatar"
              class="rounded-circle img-fluid" v-if="user.avatarId == null">
			<img :src="urlink" alt="avatar"
              class="rounded-circle img-fluid"  v-else>
			</div>
			<div class="name">
            	<h2 class="my-3" v-if="!edit">{{username}}</h2>
				<div v-else>
					<input name="username" v-model="username" placeholder="username">
					
					<input type="submit" v-on:click="login()">
					<hr>
					<label>Profile Picture
						<input type="file" id="file" ref="file" accept=".jpg,.png,.gif,.jpeg,.svg" v-on:change="handleFileUpload()"/>
					</label>
					<button v-on:click="submitFile()">Submit</button>
					<hr>
				</div>
			  <button type="button" class="button-64" v-on:click="edit = !edit">Edit</button>
			    <label class="control control-checkbox">
        		2 Auth
            	<input type="checkbox" v-model="user.doubleAuth" v-bind="user.doubleAuth" v-on:click="doubleauth()">
				<div class="control_indicator"></div>
			</label>
			</div>
			  <div class="stasts">
			<table>
				<thead><tr><th colspan="1">Stats</th></tr></thead>
				<tbody>
					<tr>
						<td><p class="mb-0">Win : {{user.win}}</p></td>
					</tr>
					<tr>
						<td><p class="mb-0"> Loss : {{user.loss}}</p></td>
						</tr>
						<tr>
						<td><p class="mb-0">Rank : {{user.rank}}</p></td>
						</tr>
				</tbody>
			</table>
			</div>
		</div>
		<div class="right">
            <hr>
            <MatchHistory v-if='id' :userid="id" :username="username"/>
			<hr>
			<Achievement v-if='id' :userid="id"/>
		</div>
  </div>
</template>

<script lang="ts">

const Vue = require('vue');
const axios = require("axios").default;
const router = require('@/router');
import { defineComponent, nextTick } from 'vue'
import { useToast } from "vue-toastification";
import $axios from '../plugin/axios';
import $socket from '../plugin/socket'
// import Profile from '@/components/Profile.vue' // @ is an alias to /src
import MatchHistory from '@/components/MatchHistory.vue'
import Achievement from '@/components/Achievement.vue';
// Vue.component('Player', Profile);

export default defineComponent({
  name: 'Profile',
  components: {
    MatchHistory: MatchHistory,
    Achievement: Achievement,
},
  data() {
    return {
		ret: 'test',
      	user: {
	doubleAuth: false,

	avatarId: '',

	username: '',

	login42: '',

	email: '',

	win: 0,

	loss: 0,

	match: 0,

	rank: 0,

	picture: '',

	friendslist: [],},
	  	urlink: '',
		edit: false,
		username: "",
		id: '',
		file: '',
		checked: false,
		check: false,
	      }
  },
  methods: {
	  doubleauth() {
		  this.checked = !this.checked;
		  if(this.checked === true)
		  	localStorage.setItem('signin', '2');
		  $axios.put('/api/account/toggle2fa').then(() => {
			  console.log('it worked');
		})
	  },
     async fetchUser() {
		let url: string = 'http://' + location.hostname + ':' + process.env.VUE_APP_BACKEND_PORT;
		const toast = useToast();  
		let mv: any = this;
		
    $axios.get('/api/account/self').then((response: any) => {
        mv.user = response.data;
		mv.urlink = url + "/api/account/avatar/username/" + response.data.username;
		mv.id = response.data.id;
		console.log('salut');
		console.log(response.data);
		this.username = response.data.username;
      }).catch((z) => {
			if (typeof(z.response.data.message) === 'string')
				toast.error(z.response.data.message);
			else
				toast.error(z.response.data.message[0]);
      });
	
	},



	async login() {
		const username = {username: this.username};
		const toast = useToast();  
    const oldUsername = localStorage.getItem('username');
		
		console.log(oldUsername + " est maintenankoilt " + username);
		$axios({url: '/api/account/register_username', data: username, method: 'PUT' }).then(() => {
			console.log('test');
			toast.success("Username succesfuly changed !");
			$axios({url: '/api/chat/register_username', data: {username : oldUsername, hjfsdhfjksd : ""}, method: 'PUT' }).then(() => {});
			localStorage.setItem('username', this.username);
        	$socket.emit('addName', 1);
		}).catch((z) => {
			if (typeof(z.response.data.message) === 'string')
				toast.error(z.response.data.message);
			else
				toast.error(z.response.data.message[0]);
      })
  	},
	submitFile()
      {
		  	const toast = useToast();
            let formData = new FormData();
            formData.append('file', this.file);
            $axios.post( '/api/account/uploadfile',
              formData,
              {
              headers: {
                  'Content-Type': 'multipart/form-data'
              }
            }
            ).then(function(){
				toast.success("Picture succesfuly changed !");
        })
        .catch(function(){
          console.log('UPLOAD FILE FAILURE :(');
        });
      },
    handleFileUpload(){
		let mv = this;
      this.file = (this.$refs.file as any).files[0];
    },
	checkach() {
		const username = this.user.login42;
		console.log('testsss');
		console.log(username);
		if(username == 'addubois' || username == 'fsacquin' || username == 'admadene' || username == 'esaci' || username == 'ogenser')
			$axios.put('/api/account/achievement/twelve').then(() => {
				console.log('youhou')
			});
		if(this.user.match > 0)
		{
			$axios.put('/api/account/achievement/two');
		}
		if(this.user.win > 0)
		{
			$axios.put('/api/account/achievement/three');
		}
		if(this.user.win >= 5)
		{
			$axios.put('/api/account/achievement/four');
		}
		if(this.user.win >= 10)
		{
			$axios.put('/api/account/achievement/five');
		}
		if(this.user.rank >= 200)
		{
			$axios.put('/api/account/achievement/six');
		}
		if(this.user.rank >= 500)
		{
			$axios.put('/api/account/achievement/seven');
		}
		// 		if(this.user.win > 0)
		// {
			
		// }
		if(this.user.loss >= 5)
		{
			$axios.put('/api/account/achievement/ten');
		}
		if(this.user.win > 0)
		{
			$axios.put('/api/account/achievement/eleven');
		}
	}

  },
  mounted() {
	  this.fetchUser();
  },
  watch: {
	  user (newUser: any) {
		  console.log(newUser);
		  this.checkach();
	  }
  }
})
</script>

<style lang="scss" scoped>

	.profile {
		display: flex;
		overflow-y: auto;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-around;
		align-items: center;
		align-content: space-between;
		color: white;

		.left {
			display: flex;
			flex-direction: column;
			flex-wrap: wrap;
			justify-content: space-between;
			align-items: center;
			align-content: center;
			.stats {
				display: flex;
				align-content: stretch;
				align-items: stretch;
			}

			.name {
				display: flex;
				flex-direction: column;
				align-items: center;
				align-content: center;
			}

		}

		.right {
			display: flex;
			flex-direction: column;
			flex-wrap: wrap;
			justify-content: space-between;
			align-items: center;
			align-content: center;
		}
	}

td {
    border: 1px solid #333;
	background-color: #777;
}

table {
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
  font-family: Arial, Helvetica, sans-serif;
  list-style: none;
  margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
}

thead,
tfoot {
	text-align: center;
    background-color: #333;
    color: #fff;
}
.name {
	border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
	margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
}
img {
  //display: block;
border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
  max-width:250px;
  max-height:150px;
  width: auto;
  height: auto;
}

.button-64 {
  align-items: center;
  background-image: linear-gradient(144deg,#AF40FF, #5B42F3 50%,#00DDEB);
  border: 0;
  border-radius: 8px;
  box-shadow: rgba(151, 65, 252, 0.2) 0 15px 30px -5px;
  box-sizing: border-box;
  color: #FFFFFF;
  display: flex;
  font-family: Phantomsans, sans-serif;
  font-size: 20px;
  justify-content: center;
  line-height: 1em;
  max-width: 100%;
  min-width: 140px;
  padding: 3px;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  cursor: pointer;
}

.button-64:active,
.button-64:hover {
  outline: 0;
}

.button-64 span {
  background-color: rgb(5, 6, 45);
  padding: 16px 24px;
  border-radius: 6px;
  width: 100%;
  height: 100%;
  transition: 300ms;
}

.button-64:hover span {
  background: none;
}

@media (min-width: 768px) {
  .button-64 {
    font-size: 24px;
    min-width: 196px;
  }
}

.control {
    font-family: arial;
    display: block;
    position: relative;
    padding-left: 30px;
    margin-bottom: 5px;
    padding-top: 3px;
    cursor: pointer;
    font-size: 16px;
}
    .control input {
        position: absolute;
        z-index: -1;
        opacity: 0;
    }
.control_indicator {
    position: absolute;
    top: 2px;
    left: 0;
    height: 20px;
    width: 20px;
    background: #e6e6e6;
    border: 0px solid #000000;
    border-radius: 0px;
}
.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
    background: #cccccc;
}

.control input:checked ~ .control_indicator {
    background: #2aa1c0;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
    background: #0e6647;
}
.control input:disabled ~ .control_indicator {
    background: #e6e6e6;
    opacity: 0.6;
    pointer-events: none;
}
.control_indicator:after {
    box-sizing: unset;
    content: '';
    position: absolute;
    display: none;
}
.control input:checked ~ .control_indicator:after {
    display: block;
}
.control-checkbox .control_indicator:after {
    left: 8px;
    top: 4px;
    width: 3px;
    height: 8px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}
.control-checkbox input:disabled ~ .control_indicator:after {
    border-color: #7b7b7b;
}
.control-checkbox .control_indicator::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 4.5rem;
    height: 4.5rem;
    margin-left: -1.3rem;
    margin-top: -1.3rem;
    background: #2aa1c0;
    border-radius: 3rem;
    opacity: 0.6;
    z-index: 99999;
    transform: scale(0);
}
@keyframes s-ripple {
    0% {
        transform: scale(0);
    }
    20% {
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(1);
    }
}
@keyframes s-ripple-dup {
   0% {
       transform: scale(0);
    }
   30% {
        transform: scale(1);
    }
    60% {
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(1);
    }
}
.control-checkbox input + .control_indicator::before {
    animation: s-ripple 250ms ease-out;
}
.control-checkbox input:checked + .control_indicator::before {
    animation-name: s-ripple-dup;
}
</style>