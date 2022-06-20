<template>
	<!-- HTML !-->
  <div class="home">
	  <Game ref="gameRef" :key="gamekey" v-if="roomExist" :roomid="roomid" :lname="lplayername" :rname="rplayername" :boardexist="boardexist" :gamekey="gamekey"/>
	<div class="flex-container">
    <!-- <div class="flex-item"><button @click="forceRerender" v-if="roomExist" class="button-85">Testlol</button></div> -->

		
        <div class="flex-item"><button @click="requestplay" v-if="!roomExist && !waiting" class="button-85">Play Classic</button></div>
		<div class="flex-item" v-if="waiting"><h1 class="wait">Waiting for Another player, player waiting: </h1></div>
		<div class="flex-item"><button @click="requestplayspecial" v-if="!roomExist && !waiting" class="button-85">Play Special</button></div>
		<div class="flex-item"><button @click="requestplayNoEdge" v-if="!roomExist && !waiting" class="button-85">Play NoEdge</button></div>
		<div class="flex-item"><button class="button-85" v-if="!roomExist && !waiting" @click="requestspectate()">Spectate</button></div>
		<template v-if="spectate" >
		<div class="list">
		<matchItem
        v-for="match in matchs" 
		:key="match.rid"
        :user="match"
		@click="requestspectator(match)"/>
		</div>
		</template>
	</div>
  <!-- <button @click="requestplay" v-if="!roomExist">I want to play{{roomid}}</button>
  Want to Watch?
  <input type="number" name="room number" id="roomid" value="0" @submit="requestspectator"/>
  <button @click="requestspectator">submit</button>
  </form> -->
    
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'
import { useToast } from 'vue-toastification'
import Game from '../components/Game.vue' 
import matchItem from '../components/AchievementItem.vue'
import { ref, reactive, onMounted, onBeforeUpdate, onUpdated, watch, nextTick} from 'vue'
import $socket from '../plugin/socket'
import $router from '../router';
import $axios from '../plugin/axios';
import { onBeforeRouteLeave } from 'vue-router'

  let roomid = ref(null);
  let waiting = ref(false);
  let boardexist = ref(true);
  let spectate = ref(false);
  let roomExist = ref(false);
  let lplayername = ref(false);
  let rplayername = ref(false);
  let matchs = ref(false);
  let gamekey = ref(0);
  let gameRef = ref();
  const toast = useToast();

onBeforeRouteLeave(() => {
	$socket.emit('pongeject', localStorage.getItem('username'));
})

// onBeforeUpdate(() => {
// 	$socket.emit('pongeject', localStorage.getItem('username'));
// })
function forceRerender() {
  console.log("roomid", roomid.value);
  //$socket.emit('hardstop', roomid.value); 
  boardexist.value = false;
  roomExist.value = false;
  waiting.value = false;
  // waiting.value = false;
  // gameRef.value.$destroy();
  // Game.$forceUpdate();
  // .$forceUpdate();
  gamekey.value += 1;
  console.log("lol", gamekey.value);
  // window.location.reload();
};
$socket.on('hardstop', (data) => {
	forceRerender();
});

function requestplay() {
	console.log($router.currentRoute.value.params.chall)
	if(!$router.currentRoute.value.params.chall)
	{
		waiting.value = true;
		console.log("wanna play", localStorage.getItem('username'));
		$socket.emit('pongplayrequest', localStorage.getItem('username'));  
		spectate.value = false;
	}
  //gameName.value = "Game";
};
function requestplayspecial() {
	if(!$router.currentRoute.value.params.chall)
	{
		waiting.value = true;
		console.log("wanna play", localStorage.getItem('username'));
		$socket.emit('pongplayrequestspecial', localStorage.getItem('username')); 
		spectate.value = false; 
	}
};
function requestplayNoEdge() {
	if(!$router.currentRoute.value.params.chall)
	{
		waiting.value = true;
	console.log("wanna play", localStorage.getItem('username'));
	$socket.emit('pongplayrequestnoedge', localStorage.getItem('username'));  
	spectate.value = false;
	}
};
function requestspectate() {
	if(!$router.currentRoute.value.params.chall)
	{
		//waiting.value = true;
		console.log('request specate');
		spectate.value = !spectate.value;
		if(spectate.value === true)
			$socket.emit('pongspecatelist');
	} 
};

function requestspectator(rid : {}) {
	if(!$router.currentRoute.value.params.chall)
	{
    	$socket.emit('pongwatchrequest', rid);
		spectate.value = false;
	}
};

$socket.on('roomassign', (room) => {
		console.log(room.room, " est notre room de pong");
    roomid.value = room.room;
    console.log(room.idl, room.idr, " est notre room defgdhthtryh pong");
		lplayername.value = room.idl;
		rplayername.value = room.idr;
		roomExist.value = true;
    //gameName.value = "Game";
		});

$socket.on('specatelist', (matchlist) => {
	console.log(matchlist);
	matchs.value = matchlist;
	console.log(matchs.value);
})

</script>

<style lang="scss" scoped>
    // html, body {
    // margin:0px;
    // height:100%;
    // }
	.list {
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
  font-family: Arial, Helvetica, sans-serif;
  list-style: none;
  margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
}
	.home {
		background-image: url(../assets/background.svg);
		background-size: 100%;
		color: white;
	}
	.flex-container {
		display: block;
		// flex-direction: column;
		// flex-wrap: wrap;
		// justify-content: space-around;
		// align-content: center;
		// align-items: auto;
    }

	.flex-item {
		flex: 0 0 auto;
		margin-top: 5%;
		color: white;
	}
	
	.wait {

		  border: 1px solid #bbb;
			border-radius: 0.5rem;
			box-shadow: 1px 1px 10px #777;
			margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
	}


/* CSS */
.button-85 {
  padding: 0.6em 2em;
  border: none;
  outline: none;
  color: rgb(255, 255, 255);
  background: #111;
  cursor: pointer;
  position: relative;
  z-index: 0;
  border-radius: 10px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  font-size: large;
}

.button-85:before {
  content: "";
  background: linear-gradient(
    45deg,
    #ff0000,
    #ff7300,
    #fffb00,
    #48ff00,
    #00ffd5,
    #002bff,
    #7a00ff,
    #ff00c8,
    #ff0000
  );
  position: absolute;
  top: -2px;
  left: -2px;
  background-size: 400%;
  z-index: -1;
  filter: blur(5px);
  -webkit-filter: blur(5px);
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  animation: glowing-button-85 20s linear infinite;
  transition: opacity 0.3s ease-in-out;
  border-radius: 10px;
}

// @keyframes glowing-button-85 {
//   0% {
//     background-position: 0 0;
//   }
//   50% {
//     background-position: 400% 0;
//   }
//   100% {
//     background-position: 0 0;
//   }
// }

.button-85:after {
  z-index: -1;
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: #222;
  left: 0;
  top: 0;
  border-radius: 10px;
}

</style>