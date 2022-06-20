<template>
<div class="MatchHistory">
	<h2>Match History</h2>
	<div v-if="showLess">
		<div v-for="(match,index) in sortedMatch">
			<template v-if="index < 5">
			<div v-if="match.winner_name === username" class="gold">
				{{match.winner_name}} ({{match.winner_rank}}) : {{match.winnerscore}} <strong class="vs"> VS </strong> {{match.looser_name}} ({{match.looser_rank}}) : {{match.looserscore}} 
			</div>
			<div v-else class="red">
				{{match.winner_name}} ({{match.winner_rank}}) : {{match.winnerscore}} <strong class="vs"> VS </strong> {{match.looser_name}} ({{match.looser_rank}}) : {{match.looserscore}} 
			</div>
			</template>
		</div>
	</div> 
	<div v-else> 
		<div v-for="(match, index) in sortedMatch">
		<template v-if="index < 15">
			<div v-if="match.winner_name === username" class="gold">
				{{match.winner_name}} ({{match.winner_rank}}) : {{match.winnerscore}} <strong class="vs"> VS </strong> {{match.looser_name}} ({{match.looser_rank}}) : {{match.looserscore}} 
			</div>
			<div v-else class="red">
				{{match.winner_name}} ({{match.winner_rank}}) : {{match.winnerscore}} <strong class="vs"> VS </strong> {{match.looser_name}} ({{match.looser_rank}}) : {{match.looserscore}} 
			</div>
		</template>
		</div>
	</div>
	<button @click="showLess = !showLess"></button>
</div>
</template>

<script lang="ts">
import $axios from '../plugin/axios'
import {defineComponent} from 'vue'
export default defineComponent({
	props: ['userid', 'username'],
  name: "MatchHistory",
  data() {
    return {
		showLess: true,
      match: [{id: '', winner_name: '', looser_name: '', winnerscore: '', looserscore: '', winner_rank: '', looser_rank: ''}],
	  croppedmatch: [],
    };
  },
  mounted() {
	  let mv = this;
	  console.log('test', this.userid);
    $axios.get('/api/account/matchHistory/id/' + this.userid)
      .then((res) => {
		 	console.log(res); 
		  mv.match = res.data});
  },
  methods: {
  },
  computed: {
    sortedMatch() {
      return [...this.match].sort((a, b) =>
		
		Number(a.id) > Number(b.id) ? -1 : 1
      );
    },
  },
});
</script>

<style scoped>
.MatchHistory {
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
  font-family: Arial, Helvetica, sans-serif;
  list-style: none;
  margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
}
.MatchHistory__item--move {
  transition: transform 0.2s;
}
.message {
  text-align: center;
}

.gold {
	color: greenyellow;
}

.vs {
	color: gold;
}
.red {
	color: red;
}
</style>