<script setup lang="ts">
	import { ref, reactive, onMounted, onBeforeUpdate, onUpdated, watch, nextTick, Ref} from 'vue'
	import { useRouter } from "vue-router";
	import io, { Socket } from 'socket.io-client'
	import { Axios, AxiosInstance } from 'axios';
	import $socket from '../plugin/socket'
	import $axios from '../plugin/axios'

interface User {
		
}

class bloc {
		username = ``;
		messages : Array<string>;
		socketid = '';
		is_user = false;
		date = '';
		id = 0;
		constructor(username : string, msg : any, date : any, socketid : string, chatRoomId : number) 
		{
			this.socketid = socketid;
			this.username = username;
			this.messages = msg;
			this.is_user = username === props.myName;
			this.date = date;
			this.id = chatRoomId;
		}
	}
	const props = defineProps({
		ongletName: String,
		myName : String,
		socket : Socket,
		getuserdata : Axios,
		list_user : Set,
		chatRoomId : Array,
		roomType : Boolean,
		password : String,
		blocklist: Object,
	});
	const rmessage = ref('');
	const rusername = ref('');
	const input_chatt = ref();
	const currentusername = ref(props.myName);
	const list_users : Ref = ref(new Set()); //set des noms d'utilisateur
	const list_all_users = ref(new Set());
	const wholeChat = ref(new Array()); //Array de= ref();
	const emitter = defineEmits(['input_c', 'input_u', 'input_cu','close_c', 'delete_c']);
	const router = useRouter();
	const list_admins = ref(new Set());
	const blocklist =  ref(new Set());
	const list_muted = ref(new Set());

	watch(() => (props.blocklist && props.blocklist.length), () => {
		blocklist.value = new Set();
		for(var i = 0;props.blocklist &&  i < props.blocklist.length; ++i){
			blocklist.value.add(props.blocklist[i].username);
		}
	})
	watch(() => (props.list_user && props.list_user.size), (newList) => {
		if (props.chatRoomId && props.chatRoomId[0] == 1 && props.list_user){
			list_users.value = new Set([... props.list_user,... list_all_users.value]);
		}
		currentusername.value = props.myName;
	})
	watch(() => (props.myName), (newName, oldName) => {
		list_all_users.value.delete(currentusername.value);
		list_users.value.delete(oldName);
		list_users.value.add(newName);
		currentusername.value = props.myName;
	})
	window.addEventListener('keydown', (e) => {
		if (e.key === '/' && document.activeElement !== input_chatt.value){
			emitter('input_c', input_chatt.value);
			e.preventDefault();
		}
	});
	onMounted(async () => {
		// console.log("Chat Room s'ouvre avec un password de " + props.password);
		currentusername.value = props.myName
		await $axios.get('/api/account/blocklist').then((response) => 
    	{
			for(var i = 0; i < response.data.length; ++i)
					blocklist.value.add(response.data[i].username);
		});
		await $axios.post('api/chat/search/chatRoom/' + props.ongletName, {pswd : props.password, is_chatRoom: props.roomType}).then((response) => {
			var id0 = props.chatRoomId ? Number(props.chatRoomId[0]) : 0;
			if (response.data.length){
				var temp, date = new Date().toLocaleString().slice(0, 12);
				for (var i = 0; i < response.data.length;){
					if (blocklist.value.has(response.data[i].username)){
						++i;
						continue;
					}
					if (response.data[i].date === null){
						list_all_users.value.add(response.data[i].username);
						++i;
						continue;
					}
					temp = new bloc(response.data[i].username, [response.data[i].messages], response.data[i].date, response.data[i].socketid, id0)
					list_all_users.value.add(temp.username);
					for (++i; i < response.data.length && response.data[i].username === temp.username; i++){
						temp.messages.push(response.data[i].messages);
					}
					for(var y = 0; temp.date !== null && y < temp.date.length; y++){
						if (temp.date[y] === ','){
							for(var j = y + 2; temp.date !== null && j < temp.date.length; j++)
							{
								if (temp.date[j] === ' '){
									temp.date = temp.date.slice(y + 1, j);;
									break;
								}
							}
						}
					}
					wholeChat.value.push(temp);
				}
			}
		}).catch(() => {
			emitter('delete_c', props.ongletName);
		});
		if (props.roomType){
			await $axios.get('/api/chatid/mute/' + props.ongletName).then((response) => 
			{
				for(var i = 0; i < response.data.length; ++i){
						list_muted.value.add(response.data[i].username);
				}
			});
			await $axios.get('api/chatid/admins/' + props.ongletName).then((response) => {
				list_admins.value = new Set([... response.data]);
			})
		}
		if (!list_all_users.value.has(props.myName) && props.myName){
			$axios.post('/api/chat', new bloc(props.myName, props.myName + " join the Room!", null, '', (props.chatRoomId ? Number(props.chatRoomId[0]) : 0)));
			list_all_users.value.add(props.myName);
		}
		var id0 = props.chatRoomId ? Number(props.chatRoomId[0]) : 0;
		var id1 = props.chatRoomId ? Number(props.chatRoomId[1]) : 0;
		if (id0 == 1 && props.list_user)
			list_users.value = new Set([... props.list_user, ... list_all_users.value]);
		else if (id0 == 1)
			list_users.value = new Set([... list_all_users.value]);
		else if (id0 != id1)
			list_users.value = new Set([props.ongletName, props.myName]);
		else
			list_users.value = new Set([... list_all_users.value].sort());
	});
	onUpdated(() => {})
	function submit(){
		var flag_letter = false;
		for (var i = 0, letter = rmessage.value[i]; i < rmessage.value.length; i++, letter = rmessage.value[i])
		{
			if (letter !== ' '){
				flag_letter = true;
				break;
			}
		}
		if (flag_letter === false)
			return ;
		var id0 = props.chatRoomId ? Number(props.chatRoomId[0]) : 0;
		var id1 = props.chatRoomId ? Number(props.chatRoomId[1]) : 0;
		if (props.ongletName !== 'General' && props.ongletName !== currentusername.value && $socket)
			$socket.emit('openTab', {id1 : id0, id2 : id1, hisName : props.ongletName});
		if (props.myName)
			wholeChat.value.length && wholeChat.value.slice(-1)[0].socketid === $socket.id ? (wholeChat.value.slice(-1)[0].messages.push(rmessage.value), wholeChat.value.slice(-1)[0].date = new Date().toLocaleString())
				: wholeChat.value.push(new bloc(props.myName, [rmessage.value], new Date().toLocaleString(), '', (props.chatRoomId ? Number(props.chatRoomId[0]) : 0)));
		var temp = wholeChat.value.slice(-1)[0];
		$axios.post('/api/chat', new bloc(temp.username, temp.messages.slice(-1)[0], temp.date, temp.socketid, id0));
		for(var y = 0; wholeChat.value.slice(-1)[0].date !== null && y < wholeChat.value.slice(-1)[0].date.length; y++){
			if (wholeChat.value.slice(-1)[0].date[y] === ','){
				for(var j = y + 2; wholeChat.value.slice(-1)[0].date !== null && j < wholeChat.value.slice(-1)[0].date.length; j++)
				{
					if (wholeChat.value.slice(-1)[0].date[j] === ' '){
						wholeChat.value.slice(-1)[0].date = wholeChat.value.slice(-1)[0].date.slice(y + 1, j);;
						break;
					}
				}
			}
		}
		if ($socket)
			$socket.emit("addMessage", {msg : wholeChat.value.slice(-1)[0], id : id1});
		rmessage.value = '';
	}

	function submituser(){
		if (rusername.value === ``)
			return ;
		wholeChat.value = wholeChat.value.map(x => x.socketid === $socket.id ? new bloc(rusername.value, x.messages, x.date, x.socketid, (props.chatRoomId ? Number(props.chatRoomId[0]) : 0)) : new bloc(x.username, x.messages, x.date, x.socketid, (props.chatRoomId ? Number(props.chatRoomId[0]) : 0)));
		if ($socket)
			$socket.emit("changeUserName", new bloc(rusername.value, null, currentusername.value, $socket.id, (props.chatRoomId ? Number(props.chatRoomId[0]) : 0)));
		currentusername.value = rusername.value;
		emitter('input_cu', currentusername.value);
	}
	function erase(){
		wholeChat.value = [];
	}
	async function menuUser(key : any, nom : any){
		key.preventDefault();
		await nextTick();
		emitter('input_u', true, key.y, key.x, props.ongletName , nom, {imadmin : list_admins.value.has(currentusername.value), hesadmin : list_admins.value.has(nom)});
	}
	async function menuChat(key : any){
		key.preventDefault();
		await nextTick();
		emitter('input_u', true, key.y, key.x, props.ongletName, null, {imadmin : list_admins.value.has(currentusername.value), hesadmin : false});
	}
	async function scrollAfter(){
		await nextTick();
		for (var i = 0; i < document.getElementsByClassName("bloclist").length; i++)
			document.getElementsByClassName("bloclist")[i].scrollTo(0, document.getElementsByClassName("bloclist")[i].scrollHeight);
	}

	$socket.on('addMessage' + (props.chatRoomId ? Number(props.chatRoomId[0]) : 0), (blocvar) => {
		if (blocklist.value.has(blocvar.username) || blocvar.username == currentusername.value)
			return;
		blocvar.is_user = blocvar.socketid == $socket.id;
		wholeChat.value.slice(-1)[0].username === blocvar.username ? wholeChat.value.slice(-1)[0].messages.push(blocvar.messages.slice(-1)[0]) : wholeChat.value.push(blocvar);
		scrollAfter();
		list_all_users.value.add(blocvar.username);
	});
	$socket.on('changeUserName', (blocvar) => {
		list_users.value.delete(blocvar.date);
		list_users.value.add(blocvar.username);
		if (blocvar.socketid != $socket.id)
			wholeChat.value = wholeChat.value.map(x => x.socketid === blocvar.socketid ? new bloc(blocvar.username, x.messages, x.date, x.socketid, (props.chatRoomId ? Number(props.chatRoomId[0]) : 0)) : new bloc(x.username, x.messages, x.date, x.socketid, (props.chatRoomId ? Number(props.chatRoomId[0]) : 0)));
	});
	$socket.on("addUser" + (props.chatRoomId ? Number(props.chatRoomId[0]) : 0), (newUser) => {
		if (blocklist.value.has(newUser))
			return;
		list_users.value.add(newUser);
	})
	$socket.on("majAdmins" + (props.chatRoomId ? Number(props.chatRoomId[0]) : 0), async ()=>{
		console.log("Un nouvel Admin ???!");
		await $axios.get('api/chatid/admins/' + props.ongletName).then((response) => {
			list_admins.value = new Set([... response.data]);
		})
	})
	$socket.on("Banned" + props.ongletName, (hisName) => {
		list_users.value.delete(hisName);
	})
	$socket.on("Muted" + props.ongletName, (hisName) => {
		list_muted.value.add(hisName);
	})
	$socket.on("unMuted" + props.ongletName, (hisName) => {
		list_muted.value.delete(hisName);
	})
	function test_button(){
		$axios.get('api/chat/search/id/'+ (props.chatRoomId ? Number(props.chatRoomId[0]) : 0)).then((response) => {
			console.log(response.data.length + " est la taille de que ce quil me renvoie!");
		});
	}

	function linkToUser(name : string){
		$axios.get('api/account/search/username/' + name).then((response) => {
			router.push('/user/' + response.data.id);
		})
	}

</script>

<style scoped src="../../css/ChatViewStyle.css">
</style>

<template>
		<div class="wholechat" @contextmenu="menuChat($event)" v-bind:style="[props.roomType ? {} : {width: '25%'}]">
			<div class="div_input_user">
				<button class="buttonMinimize" @click="emitter('close_c')"><img src="../assets/minimize.png" class="imageMinimize"></button>
			<!-- <button class="buttonErase" @click="emitter('close_c')"><img src="../assets/minimize.png" width="16" height="15"></button> -->
			</div>
			<div v-if="props.roomType" class="float_right list_users scrollbar">
				<div v-for="username in list_users" class="blocUsername" @contextmenu.stop="menuChat($event)" @contextmenu="menuUser($event, username)" @click="linkToUser(username)">
						<div v-if="props.ongletName != 'General' || (props.list_user && props.list_user.has(username))">
						<img v-if="blocklist.has(username)" class="imageRocket" src="../assets/blockRocket.png">
						<img v-if="list_muted.has(username)" class="imageRocket" src="../assets/muteRocket.webp">
						<img v-if="list_admins.has(username)" class="imageRocket" src="../assets/rocketAdmin.png">
						<img v-if="props.list_user && !props.list_user.has(username)" class="imageRocket" :src="require(`../assets/grayrocket.png`)">
						<img v-else class="imageRocket" :src="username === currentusername ?  require(`../assets/bluerocket.png`) : require(`../assets/rocket.png`)"><strong>{{username}}</strong>
						</div>
				</div>
			</div>
			<div id="style-1" class="float_left bloclist scrollbar" v-bind:style="[props.roomType ? {} : {width: '100%'}]">
				<div id="messagezone">
					<div v-for="chat in wholeChat" :key="chat" :class="chat.is_user ? 'myBubble' : 'hisBubble'">
						<div class="username"><em :class="chat.is_user ? 'self_user' : 'other_user'">{{chat.username}}:</em></div>
						<div class="bloc_message"
						v-for="message in chat.messages" :key="message"
						>
							<div :class="chat.is_user ? 'self_bloc' : 'other_bloc'">
								<strong :class="chat.is_user ? 'self_user' : 'other_user'">{{message}}</strong>
							</div>
						</div>
					<div class="date"><em :class="chat.is_user ? 'self_user' : 'other_user'">{{chat.date}}</em></div>
				</div>
			</div>
		</div>
		<form class="div_input_chat" @submit.prevent>
			<input v-if="!list_muted.has(props.myName)" class="input_chat" placeholder="Write a message!" v-model="rmessage" @keypress.enter="submit" ref="input_chatt"/>
			<input v-else class="input_chat" placeholder="You Are Muted!" ref="input_chatt"/>
		</form>
	</div>
</template>
