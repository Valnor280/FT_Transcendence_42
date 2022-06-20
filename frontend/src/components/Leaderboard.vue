<template>
  <div class="leaderboard">
	<h2>Leaderboard</h2>
    <transition-group
      move-class="leaderboard__item--move"
      v-if="users.length > 0"
    >
      <LeaderboardItem
        v-for="user in users"
        :key="user.id"
        :user="user"
        v-on:click="linktoprofile(user)"/>
    </transition-group>
    <p class="message" v-else>Nothing to show</p>
  </div>
</template>

<script lang="ts">
import LeaderboardItem from "./LeaderboardItem.vue";
import $axios from '../plugin/axios'
import { defineComponent } from "vue";
export default defineComponent({
  name: "Leaderboard",
  components: {
    LeaderboardItem: LeaderboardItem,
  },
  data() {
    return {
      users: [{id: '', rank: '', username: ''}],
    };
  },
  mounted() {
	  let mv = this;
    $axios.get('/api/account/')
      .then((res) => {
		mv.users = res.data;
		mv.sortedUsers();}
	);
  },
  methods: {
	linktoprofile(user : any) {
		this.$router.push('/user/' + user.id);
	},
	sortedUsers() {
      this.users = this.users.sort((a, b) =>
        a.rank === b.rank
          ? a.username.localeCompare(b.username)
          : a.rank > b.rank
          ? -1
          : 1
      );
	  console.log(this.users)
    },
  },
});
</script>

<style scoped>
.leaderboard {
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
  font-family: Arial, Helvetica, sans-serif;
  list-style: none;
  margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
}

h2 {
	color: gold;
}
.leaderboard__item--move {
  transition: transform 0.2s;
}
.message {
  text-align: center;
}
</style>