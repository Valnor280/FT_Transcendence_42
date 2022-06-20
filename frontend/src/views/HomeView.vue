<template>
  <div class="home">
	<Leaderboard :users="users"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Leaderboard from "@/components/Leaderboard.vue";
import $axios from '../plugin/axios';
import { useToast } from "vue-toastification";

export default defineComponent({
  name: 'HomeView',
  components: {
	Leaderboard : Leaderboard
  },
  data() {
    return {
      users: {},
    };
  },
  mounted() {
	const toast = useToast();
	let mv = this;
    $axios.get('/api/account/')
      .then((res) => (mv.users = res.data))
      .catch((z: any) => {
		if (typeof(z.response.data.message) === 'string')
			toast.error("Ohoh " + z.response.data.message);
		else
			toast.error("Ohoh " + z.response.data.message[0]);})
  },
})
</script>

<style lang="scss" scoped>

    html, body {
    margin:0px;
    height:100%;
    }
</style>
