<script setup lang="ts">
	import { ref, reactive, onMounted, onBeforeUpdate, onUpdated, watch, nextTick, Ref} from 'vue'
	import { Axios, AxiosInstance } from 'axios';
	import $axios from "../plugin/axios"
	import $socket from "../plugin/socket"
	import { useToast } from 'vue-toastification';

	interface Room {
		chatRoomName: string;
		password: string;
	}
	const props = defineProps({
		hisName: String,
		imAdmin: Boolean,
		hesAdmin: Boolean,
		currentchat: String,
		currentid: Number,
		myName : String
	});
	const emitter = defineEmits(['input_rc', 'input_c', 'click_c', 'input_u', 'delete_c']);
	
	const flagJoin = ref(false);
	const flagCreate = ref(false);
	const flagJoining = ref(false);

	const chatRoomName = ref(null);
	const Npassword = ref(null);
	const chatRoomNameP = ref(null);
	const createJoin = ref(null);
	const submit_here = ref();
	const flagdef = ref(false);
	const list_myChatRooms : Ref< Set<Room> > = ref(new Set<Room>());
	const list_publicRooms : Ref< Set<Room> > = ref(new Set());
	const toast = useToast();
	const amAdmin = ref(false);
	const changePass = ref(false);
	const typeGame = ref(false);
	const startBan = ref(false);
	const startMute = ref(false);
	const timeBan = ref(0);
	const isPub = ref(false);
	const create = ref(false);
	const listing = ref(false);

	watch( (flagJoin), async ()=> {
		await nextTick();
		emitter('input_c', submit_here.value);
	})

	function messagePrivee (){
		emitter('input_rc', 'MP');
		emitter('click_c', props.hisName)
		emitter('input_u', false, null, null, null, null, {imadmin : false, hesadmin : false});
	}
	async function submit (){
		var tempo;
		if (chatRoomNameP.value === null){
			await $axios.get("api/chatid/search/" + chatRoomName.value).then((response) => {
				if (response.data === true && createJoin.value === false){
					emitter('input_rc', 'CR', chatRoomName.value, null);
					emitter('click_c', chatRoomName.value)
					emitter('input_u', response.data, null, null, null, null, {imadmin : false, hesadmin : false});
				}
				else if (response.data === false && createJoin.value === true){
					tempo = $axios.post("api/chatid/search", {nameChatRoom : chatRoomName.value, pswd : null, isPublic : isPub.value}).then((response) => {
						emitter('input_rc', 'CR', chatRoomName.value, null);
						emitter('click_c', chatRoomName.value)
						emitter('input_u', response.data, null, null, null, null, {imadmin : false, hesadmin : false});
					}).catch(() => {
						toast.error("Chat: Erreur Creation ChatRoom!");
					});
				}
				else{
					if (createJoin.value)
						toast.error(chatRoomName.value + " :La chatRoom existe deja !");
					else
						toast.error(chatRoomName.value + " : La chatRoom n'existe pas");
				}
			});
		}
		else{
			await $axios.post("api/chatid/search", {nameChatRoom : chatRoomName.value, pswd : chatRoomNameP.value, isPublic : isPub.value}).then((response) => {
				if (response.data == 1){
					emitter('input_rc', 'CR', chatRoomName.value, chatRoomNameP.value);
					emitter('click_c', chatRoomName.value)
					emitter('input_u', response.data, null, null, null, null, {imadmin : false, hesadmin : false});
				}
				else if (!response.data){
					emitter('input_rc', 'CR', chatRoomName.value, chatRoomNameP.value);
					emitter('click_c', chatRoomName.value)
					emitter('input_u', response.data, null, null, null, null, {imadmin : false, hesadmin : false});
				}
				else
					toast.error("Chat: Mauvais mot de Passe!");
			}).catch(() => {
				console.log("post error!");
			})
		}
		await tempo;
		leaveMenu();
	}

	async function submit_p(){
		console.log("mdp " + Npassword.value);
		await $axios.post("api/chatid/pswd/" + props.currentchat, {pswd : Npassword.value}).then((response) => {
				if (!response.data){
					toast.error("Erreur: Changement Mot de Passe "  + props.currentchat);
				}
			});
		leaveMenu();
	}

	async function changeFlag(e : any, create : any, joining : any){
		e.preventDefault();
		createJoin.value = create;
		flagJoin.value = !flagJoin.value;
		flagCreate.value = create;
		flagJoining.value = joining;
		if (!flagCreate.value && !flagJoining.value){
			await $axios.get("api/chat/search/myRooms").then((response) => {
				response.data.forEach((elem : any) => {
					list_myChatRooms.value.add(elem);
				});
			})
			await $axios.get("api/chatid/publicRooms").then((response) => {
				console.log(response.data.length + " chatroom public presents");
				response.data.forEach((elem : any) => {
					list_publicRooms.value.add(elem);
				});
			})
		}
	}

	function leaveMenu(){
		emitter('input_u', false, null, null, null, props.hisName);
	}
	async function unAdmin(){
		await $axios.delete('api/chatid/demote/' + props.currentchat + '/' + props.myName).then((response) => {
			if (response.data)
				$socket.emit('majAdmins', props.currentid);
		})
		console.log("delete " + props.currentchat)
		emitter('delete_c', props.currentchat);
		leaveMenu();
	}

	function challenge(version: number) {
		let i;
		console.log('fcnt challenge : ', version);
		$socket.emit('pongplayrequestfromchat', {username : localStorage.getItem('username'), version : version, matchid: -1})
		leaveMenu();
	}

	function joinMyChat(name : any, pswd : any){
		if (!pswd){
			emitter('input_rc', 'CR', name, null);
			emitter('click_c', props.hisName)
			emitter('input_u', false, null, null, null, null, {imadmin : false, hesadmin : false});
			return;
		}
		chatRoomName.value = name;
		flagJoin.value = true;
		flagJoining.value = true;
	}
	async function promote(){
		await $axios.get('api/chatid/promote/' + props.currentchat + '/' + props.hisName).then((response) => {
			console.log(props.currentid + " est lid du chat! :" + response.data)
			if (response.data)
				$socket.emit('majAdmins', props.currentid);
		})
	}
	async function submit_ban(){
		await $axios.post('api/chat/ban/?username=' + props.hisName + "&chatName=" + props.currentchat + "&time=" + timeBan.value);
		leaveMenu();
	}
	async function submit_mute(){
		await $axios.post('api/chat/mute/?username=' + props.hisName + "&chatName=" + props.currentchat + "&time=" + timeBan.value);
		leaveMenu();
	}
	onMounted(async () => {});
</script>

<style scoped src="../../css/menuUserStyle.css">
</style>

<template>
<ul id="div-menuUser" v-bind:style="[flagJoin ? {height : '0.23%'} : {}]">
	<div v-show="props.hisName && !startBan && !startMute && props.hisName != props.myName" class="Utilisateur">
		<div v-show="!typeGame">
			<li @click="messagePrivee">Message Privee a <strong>{{props.hisName}}</strong></li>
			<li @click="typeGame=true">Defier <strong>{{props.hisName}}</strong> !!</li>
		</div>
		<div v-show="typeGame">
			<li @click="challenge(0)">Mode Classique contre <strong>{{props.hisName}}</strong> !!</li>
			<li @click="challenge(1)">Mode Special contre <strong>{{props.hisName}}</strong> !!</li>
			<li @click="challenge(2)">Mode NoEdge contre <strong>{{props.hisName}}</strong> !!</li>
		</div>
	</div>
	<div v-show="!props.hisName && !flagJoin" class="Chat">
		<div v-show="!create && !listing && !changePass">
			<li  @click="create = true">Creer une ChatRoom !</li>
			<li  @click="listing = true">Listing ChatRooms Connu/Publique !</li>
			<li  v-show="props.imAdmin" @click="changePass = true">Changer le Mot de Passe <strong>{{props.currentchat}}</strong> !</li>
			<li  @click="changeFlag($event, false, true)">Rejoindre une Nouvelle ChatRoom !</li>
		</div>
		<div v-show="listing">
			<li  @click="changeFlag($event, false, false)">Rejoindre une de vos ChatRooms !</li>
			<li  @click="changeFlag($event, false, false), isPub = true">Rejoindre une des ChatRooms Publiques!</li>
		</div>
		<div v-show="create">
			<li  @click="changeFlag($event, true, true), isPub = true">Creer une ChatRoom <strong>Publique</strong> !</li>
			<li  @click="changeFlag($event, true, true)">Creer une ChatRoom <strong>Privee</strong> !</li>
		</div>
		<div v-show="changePass">
			<form @submit.prevent v-show="changePass" @keypress.enter="submit_p" ref="submit_passw">
				<input @submit.prevent  placeholder="New Password?" v-model="Npassword"/>
			</form>
		</div>
	</div>
	<div v-show="props.hisName && props.imAdmin && !props.hesAdmin && !startBan && !startMute">
		<li @click="startBan = true">Ban <strong>{{props.hisName}}</strong> du chat <strong>{{props.currentchat}}</strong></li>
		<li @click="startMute = true">Mute/UnMute <strong>{{props.hisName}}</strong> du chat <strong>{{props.currentchat}}</strong></li>
		<li @click="promote">Promouvoir <strong>{{props.hisName}}</strong> admin dans le chat <strong>{{props.currentchat}}</strong></li>
	</div>
	<div v-show="!create && !listing && !changePass && !props.hisName && !flagJoin && props.imAdmin && !startBan && !startMute">
		<li @click="unAdmin">Leave du chat <strong>{{props.currentchat}}</strong>!</li>
	</div>
	<div v-show="!isPub">
		<li v-show="flagJoin && !flagJoining" v-for="chatroom in list_myChatRooms">
			<div @click="joinMyChat(chatroom.chatRoomName, chatroom.password)"><strong v-if="chatroom.password">🔒</strong><strong>{{chatroom.chatRoomName}}</strong></div>
		</li>
	</div>
	<div v-show="isPub">
		<li v-show="flagJoin && !flagJoining" v-for="chatroom in list_publicRooms">
			<div @click="joinMyChat(chatroom.chatRoomName, chatroom.password)"><strong v-if="chatroom.password">🔒</strong><strong>{{chatroom.chatRoomName}}</strong></div>
		</li>
	</div>
	<form @submit.prevent v-show="flagJoin && flagJoining" @keypress.enter="submit" ref="submit_here">
		<input @submit.prevent  placeholder="ChatRoom Name?" v-model="chatRoomName" maxlength="6"/>
		<input v-show="!isPub" @submit.prevent  placeholder="ChatRoom Password?" v-model="chatRoomNameP"/>
	</form>
	<form @submit.prevent v-show="startMute" @keypress.enter="submit_mute" ref="submit_b">
		<input @submit.prevent placeholder="Time (Min)?" v-model="timeBan"/>
	</form>
	<form @submit.prevent v-show="startBan" @keypress.enter="submit_ban" ref="submit_b">
		<input @submit.prevent placeholder="Time (Min)?" v-model="timeBan"/>
	</form>
</ul>
</template>