<template>
<div>
	<template v-if="auth">
    <form @submit.prevent="login">
      <div>
        <label for="username">username</label>
        <input name="username" v-model="username" placeholder="username">
      </div>
      <input type="submit" value="register">
	<input type="file" accept="image/*" ref="fileInput" @change="uploadImage()" id="file-input">

    </form>
	</template>
	<button @click="auth42" v-else-if="!auth">42</button>
  </div>
</template>

<script lang="ts">
//auth/login42
import { defineComponent } from 'vue'
import { AUTH_REQUEST, AUTH_REGISTER } from "../store/auth";
import $axios from '../plugin/axios';

export default defineComponent({
  name: "login",
  data() {
    return {
      username: "",
      password: "",
	  email: "",
	  auth: false,
	  link: false,
    };
  },
  methods: {

    async login() {
		let urlParams = new URLSearchParams(window.location.search);
		let code = urlParams.get('code');
      const { username } = this;

	  	this.$store.dispatch(AUTH_REQUEST, { username, code}).then(() => {
			  this.$router.push('/');
		  })
  },
	auth42() {
		window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=6a19eaca884466c198efb65ceca3a20fd89f7d4227f6a8c86fda73345e1ddc74&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin%2F&response_type=code';
		this.link = true
	},
	authback(myParam: any) {
		console.log(myParam);
		this.auth = true;
	},
	uploadImage() {
	let input : any = this.$refs.fileInput
    let formData = new FormData();
    formData.append("file", input);
    return $axios.post("/api/account/uploadfile", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
    });
  }
  },
  mounted() {
	let urlParams = new URLSearchParams(window.location.search);
	let myParam = urlParams.get('code');
	if(myParam)
	{
		this.authback(myParam);
	}
  }

});



</script>