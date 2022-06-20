<template>
    <div :class="[flaglist ? 'friendsdown' : 'friendsup']">
        <h1 id="title" @click="doIEmit" >Friends List</h1>

        <div v-if="!flaglist">
            <p v-on:click="linktoprofile(friend.id)" class="friendname" v-for="friend in props.list">
                <img :src="props.listConnected && props.listConnected.has(friend.username) ? require(`../assets/rocket.png`) : require(`../assets/grayrocket.png`)" class="imageRocket">
				<p v-if="props.listPlayer && props.listPlayer.has(friend.username)">🎮</p>
                {{friend.username}}
            </p>
    <h1 @click="doIEmit" id="title" >Block List</h1>
    <p v-on:click="linktoprofile(block.id)" class="friendname" v-for="block in props.blocklist" :key="block">
        <img src="../assets/blockRocket.png" class="imageRocket">
        {{block.username}}
    </p>    
        </div>
    </div>


</template>

<style scoped src="../../css/FriendsListStyle.css">

</style>

<script setup lang="ts">
import $axios from '../plugin/axios'
import $socket from '../plugin/socket'
import {ref, watch} from 'vue';
import store from "../store";
import $router from "../router"

const props = defineProps({
    listConnected: Set,
	listPlayer: Set,
    list: Object,
    blocklist: Object
});
const emitter = defineEmits(['updateFriend']);
var size = ref();
const flaglist = ref(false);
const friendname = ref();
const showlist = ref(false);

function linktoprofile(userId: number) 
{
		$router.push('/user/' + userId);
}

function doIEmit(){
	flaglist.value = !flaglist.value
	if (flaglist.value)
		emitter('updateFriend');
}
watch(
  () => store.getters.isAuthenticated,
  (newValue) => {

  }
);

</script>