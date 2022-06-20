<template>
<table>
    <thead>
        <tr>
            <th colspan="6">Achievement</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><img v-bind:style= "[ach.one ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/diplome.jpg" title="Logged in with 42"></td>
            <td><img v-bind:style= "[ach.two ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/red-gold-medal.jpg" title="Played one match"></td>
			<td><img v-bind:style= "[ach.three ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/military-medal.jpg" title="First win"></td>
			<td><img v-bind:style= "[ach.four ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/grey-throphy.jpg" title="5 win"></td>
			<td><img v-bind:style= "[ach.five ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/three-start-trophy.jpg" title="10 win"></td>
			<td><img v-bind:style= "[ach.six ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/blue-gold-medal.jpg" title="200 Elo"></td>
        </tr>
		<tr>
			<td><img v-bind:style= "[ach.seven ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/book-star.jpg" title="500 Elo"></td>
            <td><img v-bind:style= "[ach.eight ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/lamp.jpg" title="20 win"></td>
			<td><img v-bind:style= "[ach.nine ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/gold-throphy.jpg" title="Saw the about page"></td>
			<td><img v-bind:style= "[ach.ten ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/three-start-message.jpg" title="5 loss"></td>
			<td><img v-bind:style= "[ach.eleven ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/red-military-medal.jpg" title="15 win"></td>
			<td><img v-bind:style= "[ach.twelve ? {'filter': 'grayscale(0%)'} : {'filter': 'grayscale(100%)'}]" src="../assets/achievement/throphy.jpg" title="Foundator"></td>
		</tr>
    </tbody>
</table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import $axios from '../plugin/axios'

export default defineComponent({
	props: ['userid'],
  name: "Achievement",
  data(){
	  return{
		  log: false,
		  ach: {one: '', two: '', three: '', four: '', five: '', six: '', seven: '', eight: '', nine: '', ten: '', eleven: '', twelve: ''},
	  };
  },
	methods: {
		getach() {
			let mv = this;
	  		$axios.get('/api/account/achievement/id/' + this.userid).then((resp) => {
		 	console.log(resp);
			mv.ach = resp.data;
	  	})
		},
	},
  mounted() {
	  this.getach();
  },
  })
</script>

<style lang="scss" scoped>
td {
    border: 1px solid #333;
}

table {
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 10px #777;
  font-family: Arial, Helvetica, sans-serif;
  list-style: none;
  margin: 5rem auto 0;
  padding: 2rem;
  width: 20rem;
}

thead,
tfoot {
	text-align: center;
    background-color: #333;
    color: #fff;
}

img {
  max-width:200px;
  max-height:100px;
  width: auto;
  height: auto;
}

</style>