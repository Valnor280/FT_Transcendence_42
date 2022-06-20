<template>
  <div @click="killMenu" id="test">
    <friends-list v-if="!hide"
    :listConnected="list_user"
    :listPlayer="list_player"
    :list="list"
    :blocklist="blocklist"
	@updateFriend="updateFriendss"
    />
    <appheader id="appheader" v-if="!hide"/>
    <router-view class="overlay"/>
    <appfooter v-if="!hide"
    :onglet="onglet" 
    :notRead="notRead"
    :myName="myName"
    :list_user="list_user"
    @delete_c="delete_chat"
    @click_c="close_chat" 
    @input_u="createMenuUser"
    ref="footerDiv"
    >
    </appfooter>
    <div id="list_chat" v-for="(tab, index) in onglet" :key="tab">
      <chat
        v-if="loadingChat.get(tab) && myName !== null && !hide"
        v-show="flag_c.get(tab)"
        :ongletName="tab"
        :myName="myName"
        :list_user="list_user"
        :chatRoomId="chatRoomId.get(tab)"
        :roomType="chatRoomType.get(tab)"
        :password="list_password.get(tab)"
        :blocklist="blocklist"
        @input_u="createMenuUser"
        @input_c="focus_chat"
        @input_cu="change_username"
        @close_c="close_chat(tab)"
        @delete_c="delete_chat"
        v-bind:style="{ 'margin-left': index * 15 + 1 + '%' }"
      />
    </div>
    <menu-user
      ref="menuuUser"
      @click.stop
      v-if="flag && !hide"
      v-bind:style="{
        position: 'absolute',
        top: top + 'px',
        left: left + 'px',
      }"
      @input_rc="rightClicked"
      @input_c="focus_chat"
      @click_c="close_chat"
      @input_u="createMenuUser"
	  @delete_c="delete_chat"
      :hisName="otherusername"
	  :myName="myName"
      :hesAdmin="hesAdmin"
      :imAdmin="imAdmin"
      :currentchat="currentchat"
      :currentid="chatRoomId.get(currentchat)[0]"
    />
  </div>
</template>

<script setup lang="ts">
import appfooter from "./components/AppFooter.vue";
import appheader from "./components/AppHeader.vue";
import { ref, defineProps, defineComponent, computed, Ref } from "vue";
import {
  reactive,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  nextTick,
  watch,
} from "vue";
import chat from "./components/chat.vue";
import { useRouter } from "vue-router";
import menuUser from "./components/menuUser.vue";
import io, { Socket } from "socket.io-client";
import $axios from "./plugin/axios";
import $socket from "./plugin/socket";
import store from "./store";
import $router from "./router/"
import { useRoute } from "vue-router";
import Profile from "./views/ProfileView.vue";
import FriendsList from "./components/FriendsList.vue";
import { AUTH_LOGOUT, BLOCK } from '@/store/auth';
import { useToast } from "vue-toastification"

let myName : Ref<string> = ref("");
const toast = useToast();
const route = useRoute();
const router = useRouter();
localStorage.debug = "*";
let onglet = ref();
let chatRoomType = ref(new Map());
let chatRoomId = ref(new Map());
let notRead = ref(new Set());
let socket = ref($socket);
const getuserdata = ref($axios);
const menuuUser = ref();
let footerDiv = ref();
let top = ref();
let left = ref();
let flag = ref(false);
let flag_c = ref(new Map());
let action = ref(false);
let otherusername = ref('');
let loadingChat = ref(new Map());
let list_user = ref(new Set());
let list_password = ref(new Map());
let list_player = ref(new Set());
const imAdmin = ref(false);
const hesAdmin = ref(false);
const currentchat = ref("General");
let hide = ref(false);
let hisname2 = ref('testsede');
const list = ref(new Array());
const blocklist = ref(new Array());

watch(
  () => store.getters.isAuthenticated,
  (newValue) => {
    
	if (!newValue)
	{
		 action.value = false
	}
    else if (socket.value.id != undefined)
	{
		action.value = true;
	}
  }
);

socket.value.on("hide", () => {
	console.log(router.currentRoute);
	hide.value = true;
})

socket.value.on("startplaying", (username) => {
	list_player.value.add(username);
	console.log(list_player.value);
})

socket.value.on("stopplaying", (username1, username2) => {
	if(list_player.value.has(username1))
		list_player.value.delete(username1);
	
	if(list_player.value.has(username2))
		list_player.value.delete(username2);
})

socket.value.on("stop", () => {
	hide.value = false;
	checkach();
	
})

 function checkach() {
		let username : string;
		let user : any;
		getuserdata.value
        .get("/api/account/self")
        .then((response) => {
			user = response.data;
			username = response.data.login42;
		console.log('user', user);
		if(username == 'addubois' || username == 'fsacquin' || username == 'admadene' || username == 'esaci' || username == 'ogenser')
			$axios.put('/api/account/achievement/twelve').then(() => {
				console.log('youhou')
			});
		if(user.match > 0)
		{
			$axios.put('/api/account/achievement/two');
		}
		if(user.win > 0)
		{
			$axios.put('/api/account/achievement/three');
		}
		if(user.win >= 5)
		{
			$axios.put('/api/account/achievement/four');
		}
		if(user.win >= 10)
		{
			$axios.put('/api/account/achievement/five');
		}
		if(user.rank >= 200)
		{
			$axios.put('/api/account/achievement/six');
		}
		if(user.rank >= 500)
		{
			$axios.put('/api/account/achievement/seven');
		}
		if(user.win >= 20)
		{
			$axios.put('/api/account/achievement/eight');
		}
		if(user.loss >= 5)
		{
			$axios.put('/api/account/achievement/ten');
		}
		if(user.win >= 15)
		{
			$axios.put('/api/account/achievement/eleven');
		}
		});
}

socket.value.on("hardstop", () => {
	hide.value = false;
	checkach();
})

watch(
  () => action.value,
  async (newbool, oldbool) => {
    if (newbool === true) {
      getuserdata.value
        .get("/api/account/self")
        .then((response) => {
          list_password.value.set("General", null);
          onglet.value = new Set(["General"]);
          chatRoomId.value.set("General", [1, 1]);
          loadingChat.value.set("General", true);
          chatRoomType.value.set("General", true);
          flag_c.value.set("General", false);
          myName.value = response.data.username;
          $socket.emit('addName', 1);
          if (myName.value)
            localStorage.setItem("username", myName.value);
          $axios.get('/api/account/friendslist').then((response: any) => 
          {
              list.value = response.data;
          })
          $axios.get('/api/account/blocklist').then((response: any) => 
          {
              blocklist.value = response.data;
          })
        })
        .catch((z: any) => {
			console.log('attention');
        });
    } else {
      myName.value = "";
      onglet.value = new Set(["Not Logged"]);
      loadingChat.value = new Map();
      loadingChat.value.set("Not Logged", false);
      $socket.emit('leave');
    }
  }
);

$socket.on( "connect",() => {
  console.log("Bonjour ici ca connect");
  if (store.getters.isAuthenticated == true) action.value = true;
});
if (myName.value === null) {
  onglet.value = new Set(["Not Logged"]);
}

socket.value.on("addUser" + 1, (newUser) => {
  console.log("Nouvelle connection de " + newUser);
  list_user.value.add(newUser);
});

socket.value.on("connection", (list_u) => {
  console.log("Connection au Chat !", list_u)
  myName.value = localStorage.getItem('username') || "";
  list_user.value = new Set(list_u);
  // for (var i = 0; i < 5; ++i)
    // list_user.value.add("BatJ " + i);
  loadingChat.value.set("General", true);
});
socket.value.on("newMP", ({ id1, id2, name }) => {
  chatRoomId.value.set(name, [id1, id2]);
  loadingChat.value.set(name, true);
});
socket.value.on("openTab", ({ id1, id2, hisName }) => {
  onglet.value.add(hisName);
  if (!flag_c.value.has(hisName) || !flag_c.value.get(hisName))
    notRead.value.add(hisName);
  loadingChat.value.set(hisName, true);
  chatRoomId.value.set(hisName, [id2, id1]);
});
socket.value.on("eraseName", (newName) => {
  list_user.value.delete(myName.value);
  list_user.value.add(newName);
});
socket.value.on('disconnection', (name) => {
  console.log("Deconnection de " + name)
  if (name == myName.value){
    myName.value = localStorage.getItem('username') || "";
  }
		list_user.value.delete(name);
});

socket.value.on('challengemsg', (matchid) => {
	console.log("challengemsg", hisname2.value)
	socket.value.emit('defier', {hisName: hisname2.value, version : matchid.version, matchid: matchid.matchid});
});

socket.value.on('defiance', (data) => {
  console.log("LOLLOLO", data)
  if(!hide.value){
  toast('You have been challenged by ' + data.myName, {pauseOnHover: false, icon: "fas fa-rocket", onClick: function() {
	socket.value.emit('challengeaccepted');
	router.push('/play/chall').then(() => {$socket.emit('pongplayrequestfromchat', {username: data.hisName, version: data.version, matchid: data.matchid})});
  }});
  }
});

socket.value.on('challengestart', () => {
	router.push('/play/chall');
});

socket.value.on('challengerefused', () => {
	toast.error('Challenge refused');
})

socket.value.on('kickChat', (response) =>{
  if (response.hisName == myName.value)
    delete_chat(response.chatRoomName);
  toast.info(response.hisName + " Banned From " + response.chatRoomName); 
})

async function challengeyes(data : any) {
	console.log('chalengeyes');
	//debugger;;

	socket.value.emit('challengeaccepted');
	//router.push('/play');
	//await delay(1000);
	$socket.emit('pongplayrequestfromchat', data.myName, data.version, data.matchid);
}
socket.value.on("exist", () => {
      myName.value = "";
      onglet.value = new Set(["Not Logged"]);
      loadingChat.value = new Map();
      loadingChat.value.set("Not Logged", false);
      router.push('/block')
});
socket.value.on('deleteIt', (name) => {
  delete_chat(name);
})
function challengeno() {
	socket.value.emit('challengerefused');
	toast.error('Challenge refused');
}

async function createMenuUser(flagv : any, y : any , x : any, chatname: any, hisname: any, admins: any) {
  flag.value = flagv;
  (top.value = y), (left.value = x);
  if (chatname)
    currentchat.value = chatname;
  //if (hisname)
    otherusername.value = hisname, hisname2.value = hisname;
  if (admins)
    hesAdmin.value = admins.hesadmin, imAdmin.value = admins.imadmin;
  flag.value = flagv;
}
function killMenu() {
  flag.value = false;
}
function focus_chat(chatWindow : any) {
  chatWindow.focus();
}
function change_username(name : any) {
  myName.value = name;
}
function close_chat(nom : any) {
  notRead.value.delete(nom);
  flag_c.value.set(nom, !flag_c.value.get(nom));
}
function delete_chat(nom : any){
	console.log("Jai bien recu delete pour " + nom);
  notRead.value.delete(nom);
  onglet.value.delete(nom);
  loadingChat.value.delete(nom);
  chatRoomType.value.delete(nom);
}
function rightClicked(e : any, crn : any, pswd: any) {
  if (e === "MP") {
    onglet.value.add(otherusername.value);
    socket.value.emit("newMP", otherusername.value);
    loadingChat.value.set(otherusername.value, false);
    chatRoomType.value.set(otherusername.value, false);
  } else if (e === "CR") {
    console.log(crn + " chatroom avec le pswd " + pswd)
    list_password.value.set(crn, pswd);
    onglet.value.add(crn);
    socket.value.emit("newCR", crn);
    loadingChat.value.set(crn, false);
    chatRoomType.value.set(crn, true);
  }
}
$socket.on('addFriend', async () => {
    await $axios.get('/api/account/friendslist').then((response: any) => 
    {
        list.value = response.data;
    })  
     await $axios.get('/api/account/blocklist').then((response: any) => 
    {
        blocklist.value = response.data;
    })  
})

async function updateFriendss(){
	console.log('test friend');
	await $axios.get('/api/account/friendslist').then((response: any) => 
    {
        list.value = response.data;
    })  
     await $axios.get('/api/account/blocklist').then((response: any) => 
    {
        blocklist.value = response.data;
    })  
}
onMounted(() => {
});
</script>



<style lang="scss">
* {
	 margin: 0;
}

// #appheader {
//   height: 5vh;
// }
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  // background: linear-gradient(90deg, rgba(222,133,195,1) 0%, rgba(176,40,223,1) 56%, rgba(159,55,55,1) 100%);
}

nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: white;

    &.router-link-exact-active {
      color: gold;
    }
  }
}

.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  background: url(assets/background.svg);
  background-size:cover;
  background-position: center center;
  background-attachment: fixed;
}

</style>