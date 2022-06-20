<template>
  <div class="home">
    <HelloWorld msg="Already connected on another window"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src
import $socket from '../plugin/socket'
export default defineComponent({
  name: 'HomeView',
  components: {
    HelloWorld
  },
  mounted() {
    // $socket.emit('addName', 2);
  },
beforeRouteLeave (to, from, next) {
	next('/block')
  },
})
</script>

<style lang="scss" scoped>

    html, body {
    margin:0px;
    height:100%;
    }
    .home {

    }

</style>