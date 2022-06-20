<script setup lang="ts">
  import chat from '../components/chat.vue'
  import {ref, defineProps} from 'vue'
  import $socket from '../plugin/socket'
  function onClick() {
    $socket.emit('batman', ('  '));
  }
</script>

<style scoped src="../../css/ChatViewStyle.css">
</style>

<template>
<button @click="onClick">Clique pour emettre un emit{{$socket.io.opts.extraHeaders}}</button>
</template>