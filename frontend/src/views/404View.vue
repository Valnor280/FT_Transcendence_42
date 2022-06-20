<template>
  <div class="home">
    <HelloWorld msg="404 page not found"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src

export default defineComponent({
  name: 'HomeView',
  components: {
    HelloWorld
  }
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