<template>
<div>
	<h1>TEST</h1>
	<form @submit.prevent="newuser()">
		<input v-model="name" placeholder="username">
		<input v-model="login" placeholder="login42">
		<input v-model="mail" placeholder="email">
		<input v-model="win" placeholder="win">
		<input v-model="loss" placeholder="loss">
		<input v-model="match" placeholder="match">
		<input v-model="rank" placeholder="rank">
		<button>add user</button>
	</form>
  <form @submit.prevent="addTest">
    <input v-model="newTest">
	<!-- <input v-mode="data" type="json"> -->
    <button>Add Test</button>    
  </form>
  <ul>
    <li v-for="Test in Tests" :key="Test.id">
      {{ Test.text }}
      <button @click="removeTest(Test)">X</button>
	  <button @click="testerGet(Test)">Get</button>
	  <!-- <button @click="testerPut(Test)">Put</button>
	  <button @click="testerPost(Test)">Post</button> -->
    </li>
  </ul>
  <p> result : {{ret}}</p>
  <input v-model="idValue" @keypress.enter="sendDelete" placeholder="Ecris l'id a delete!">
</div>
</template>

<script>

import $axios from '../plugin/axios';
import { useToast } from "vue-toastification";

let id = 0;
export default {
  data() {
    return {
	name: '', login: '', mail: '', win: '', loss: '', match: '', rank: '',
	ret: '', 
      newTest: '',
	  idValue : '',
	  data: {},
      Tests: [
        { id: id++, text: 'https://jsonplaceholder.typicode.com/posts/1'}
      ]
    }
  },
  methods: {
    addTest() {
      this.Tests.push({ id: id++, text: this.newTest /*, data: this.data*/})
      this.newTest = ''
	  this.data = {};
    },
	sendDelete() {
		const toast = useToast();  
		$axios.delete('/api/account/delete/id/' + this.idValue)
		.then(() => {
			console.log(this.idValue + " a bien ete delete !");
		}).catch((z) => {
			if (typeof(z.response.data.message) === 'string')
				toast.error(z.response.data.message);
			else
				toast.error(z.response.data.message[0]);
		})
	},
    removeTest(Test) {
      this.Tests = this.Tests.filter((t) => t !== Test)
    },
	makeTest(Test) {
		getarg = Test.text;
	},
	testerGet(Test) {
		$axios.get(Test.text).then((response) => {
        this.ret = response
      }).catch((z) => {
			if (typeof(z.response.data.message) === 'string')
				toast.error(z.response.data.message);
			else
				toast.error(z.response.data.message[0]);
		});
	},
	newuser() {
		let user = {username: this.name, login42: this.login, email: this.mail, win: this.win, loss: this.loss, match: this.match, rank: this.rank};

		console.log(user);
		$axios.post('/api/account/create', user).then(() => {
			console.log('usercreated');
		})
	},
	// testerPut(Test) {
	// 	$axios.put(Test.text, Test.data).then((response) => {
    //     this.ret = response
    //   }).catch(() => { this.ret = 'Error'});
	//   console.log(Test);
	// },
	// testerPost(Test) {
	// 	$axios.post(Test.text, Test.data).then((response) => {
    //     this.ret = response
    //   }).catch(() => { this.ret = 'Error'});
	//   console.log(Test);
	// },
  }
}

</script>