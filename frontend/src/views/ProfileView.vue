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
            	<h2>{{name}}</h2>
			<template v-if="name != watcher">
			<button v-if="!isfriend"  type="button" class="button-64" v-on:click="addFriend(user.username)" >Add Friend</button>
			<button v-else  type="button" class="button-64" v-on:click="removefriend()" >Remove Friend</button>
			<br/>
			
      		<button v-if="!isblock"  type="button" class="button-65" v-on:click="blockFriend(user.username)" >Block {{user.username}}</button>
			<button v-else  type="button" class="button-65" v-on:click="unblockFriend()" >Unblock {{user.username}}</button>
			</template>
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
            <MatchHistory v-if='id' :userid="id" :username="name"/>
			<hr>
			<Achievement v-if='id' :userid="id"/>
		</div>
  </div>
</template>

<script lang="ts">

const Vue = require('vue');
const axios = require("axios").default;
const router = require('@/router');
import { useToast } from "vue-toastification";
import { defineComponent } from 'vue'
import $axios from '../plugin/axios'
import MatchHistory from '../components/MatchHistory.vue'
import Achievement from '@/components/Achievement.vue';
import $socket from '../plugin/socket'
import { useRoute } from "vue-router";
// import Profile from '@/components/Profile.vue' // @ is an alias to /src

// Vue.component('Player', Profile);


export default defineComponent({
    name: "Profile",
	components: {
    MatchHistory: MatchHistory,
    Achievement: Achievement,
	},
    data() {
        return {
			name: '',
            ret: "test",
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

	friendslist: [],

			},
			urlink: '',
      isfriend: false,
      isblock: false,
	  id: '',
	  username: '',
	  watcher: '',
        };
    },
    methods: {
        async addFriend(username: string){
          let mv: any = this;
          
          const toast = useToast();
          await $axios.put('/api/account/friendslist/' + username).then((response: any) => {
            toast.success(mv.user.username + " ajouté !");
            this.isfriend = true;
            console.log(response.data);
            $socket.emit('addFriend', mv.user.username);
            }).catch((z: any) => {
				if (typeof(z.response.data.message) === 'string')
					toast.error("Ohoh " + z.response.data.message);
				else
					toast.error("Ohoh " + z.response.data.message[0]);
            });
        },
        async removefriend()
        {
            const toast = useToast();
            let mv: any = this; 
            await $axios.put('api/account/friendslist/remove/'+mv.user.username).then((response: any) => {
            toast.success(mv.user.username + " supprimé !");
            mv.isfriend = true;
            console.log(response.data);
            $socket.emit('addFriend', mv.user.username);
            }).catch((z: any) => {
				if (typeof(z.response.data.message) === 'string')
					toast.error("Ohoh " + z.response.data.message);
				else
					toast.error("Ohoh " + z.response.data.message[0]);
            });
          this.isfriend = false;

        },

        async blockFriend(username: string){
          let mv: any = this;
          
          const toast = useToast();
          await $axios.put('/api/account/blocklist/' + username).then((response: any) => {
            toast.success(mv.user.username + " bloqué !");
            this.isblock = true;
            console.log(response.data);
            $socket.emit('addFriend', mv.user.username);
            $socket.emit('blockChat', mv.user.username);
            }).catch((z: any) => {
				if (typeof(z.response.data.message) === 'string')
					toast.error("Ohoh " + z.response.data.message);
				else
					toast.error("Ohoh " + z.response.data.message[0]);
            });
        },
        async unblockFriend()
        {
            const toast = useToast();
            let mv: any = this;
            await $axios.put('api/account/blocklist/remove/'+mv.user.username).then((response: any) => {
            toast.success(mv.user.username + " débloqué !");
            mv.isblock = false;
            console.log(response.data);
            $socket.emit('addFriend', mv.user.username);
            }).catch((z: any) => {
				if (typeof(z.response.data.message) === 'string')
					toast.error("Ohoh " + z.response.data.message);
				else
					toast.error("Ohoh " + z.response.data.message[0]);
            });

        },

        fetchUser(id : any) {
			let url: string = 'http://' + location.hostname + ':' + process.env.VUE_APP_BACKEND_PORT;
            const toast = useToast();
            let mv: any = this;
            console.log(mv.$router);
            $axios.get("/api/account/search/id/" + id).then((response: any) => {
                console.log(response);
                mv.user = response.data;
				mv.urlink = url + "/api/account/avatar/username/" + response.data.username;
				mv.name = response.data.username;
                /*getuserdata.get('/user/matches/'+ 1).then(response => {
                  this.playerHistory = response.data;
                  this.playerHistory.sort((a, b) => { // sort by date
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                  });
                }).catch(() => {
                  this.$toast.error('Error while fetching matches');
                });*/
            }).catch((z) => {
                if (typeof(z.response.data.message) === 'string')
					toast.error(z.response.data.message);
				else
					toast.error(z.response.data.message[0]);
                console.error("error lol");
                //mv.$router.push({ name: 'Main' });
            });
        }
    },
    mounted() {
        let mv: any = this;
		const toast = useToast();
        mv.fetchUser(mv.$router.currentRoute._value.params.id);
		this.id = mv.$router.currentRoute._value.params.id;
        let myself: any;
        $axios.get('/api/account/self').then((response: any) => {
          myself = response.data;
          for (let i = 0; i <= myself.friendslist.length; ++i){
            console.log(i);
            if (response.data.friendslist[i] == mv.$router.currentRoute._value.params.id)
              mv.isfriend = true;
          };
		  console.log("lpop", myself.blocklist);
          for (let y = 0; y < myself.blocklist.length; ++y)
          {
            console.log("trololo", myself, y);
            if (response.data.blocklist[y] == mv.$router.currentRoute._value.params.id)
              mv.isblock = true;
          }
        }).catch((z: any) => {
			if (typeof(z.response.data.message) === 'string')
				toast.error(z.response.data.message);
			else
				toast.error(z.response.data.message[0]);
        });
        const name = localStorage.getItem('username');
		if(name)
			this.watcher =  name;
    },
	beforeRouteUpdate(to, from, next) {
    // Call the API query method when the URL changes
    this.fetchUser(to.params.id);
	      this.isfriend = false,
      this.isblock = false,
    next()
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

.button-65 {
  align-items: center;
  background-image: linear-gradient(144deg,#eb0000, #5B42F3 50%,#eb0000);

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

.button-65:active,
.button-65:hover {
  outline: 0;
}

.button-65 span {
  background-color: rgb(5, 6, 45);
  padding: 16px 24px;
  border-radius: 6px;
  width: 100%;
  height: 100%;
  transition: 300ms;
}

.button-65:hover span {
  background: none;
}


@media (min-width: 768px) {
  .button-64 {
    font-size: 24px;
    min-width: 196px;
  }
}

@media (min-width: 768px) {
  .button-65 {
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
