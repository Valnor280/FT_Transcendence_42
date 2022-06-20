<template>
<div class="login">
	<template v-if="auth">
		<div>
		<div>
			<input class="form__field" name="username" v-model="username" placeholder="username">
		</div>
	    <div class="container">
			<div class="large-12 medium-12 small-12 cell">
				<input class="btn" type="file" id="file" ref="file" accept=".jpg,.png,.gif,.jpeg,.svg" v-on:change="handleFileUpload()"/>
			</div>
		  </div>
		<button class="btn" type="submit" value="register" v-on:click="login()">register</button>
		</div>
		
	</template>
	<button @click="auth42" v-else-if="!auth && !twoauth" class="button-85">42</button>

	<template v-if="twoauth">
		<label for="code">code</label>
		<input name="code" v-model="code" placeholder="code">
		<input type="submit" value="submit" v-on:click="twoauthft()">
	</template>
  </div>
</template>

<script lang="ts">
//auth/login42
import { defineComponent } from 'vue';
import { AUTH_REQUEST, AUTH_REGISTER } from "../store/auth";
import $axios from '../plugin/axios';
import $socket from '../plugin/socket'
import { useToast } from 'vue-toastification';
export default defineComponent({
  name: "login",
  data() {
    return {
      username: "",
      password: "",
	  email: "",
	  auth: false,
	  twoauth: false,
	  link: false,
	  file: '',
	  code: '',
	  myParam: '',
    };
  },
  methods: {
	  twoauthft()
	  {
		  console.log('gg');
		  const toast = useToast();
		  let code = this.myParam;
		 
		  $axios.post('/api/auth/confirmCode', {code: this.code}).then((resp) => {
			   const auth = resp.data;
			   console.log(resp);
			  this.$store.dispatch(AUTH_REQUEST, {code, auth}).then(() => {
				  	this.$router.push('/');
			  		toast.success('Succesfully logged Welcome !');}
			  )

		  }).catch(() => {
			  toast.error('Wrong code');
		  })
	  },
    async login() {
		const toast = useToast();
		const username = {username: this.username};
		if(this.file)
			this.submitFile();
		const oldUsername = localStorage.getItem('username');
		await $axios({url: '/api/account/register_username', data: username, method: 'PUT' }).then(() => {
			console.log('test');
			this.$router.push('/');
			toast.success('Succesfully registered Welcome !');
			$axios.put('/api/account/achievement/one');
			$axios({url: '/api/chat/register_username', data: {username : oldUsername, hjfsdhfjksd : ""}, method: 'PUT' }).then(() => {});
			localStorage.setItem('username', this.username);
			$socket.emit('addName', 1);
		}).catch(() => {
			toast.error("Username already taken");
		});
		
  },
	auth42() {
		this.auth = true;
		window.location.href = '';
		this.link = true
	},
	authback(myParam: any) {
		console.log(myParam);
		const toast = useToast();
		
		let code = myParam;
		const auth = '0';
		this.$store.dispatch(AUTH_REQUEST, {code, auth}).then(() => {
			console.log(localStorage.getItem('signin') + 'pdedfwef')
			if(localStorage.getItem('signin') === '1')
			{
				this.$router.push('/');
				toast.success('Succesfully logged Welcome !')
			}
			else if(localStorage.getItem('signin') == '2')
			{
				console.log('lolololo')
				this.twoauth = true;
			}
			else if(localStorage.getItem('signin') == '0')
				this.auth = true;
			
			console.log(localStorage.getItem('signin'))
		})
	},
  	submitFile()
      {
            let formData = new FormData();
            formData.append('file', this.file);
            $axios.post( '/api/account/uploadfile',
              formData,
              {
              headers: {
                  'Content-Type': 'multipart/form-data'
              }
            }
            ).then(function(){
          console.log('UPLOAD FILE SUCCESS !!');
        })
        .catch(function(){
          console.log('UPLOAD FILE FAILURE :(');
        });
      },
    handleFileUpload(){
		let mv = this;
      this.file = (this.$refs.file as any).files[0];
    },
  },
  mounted() {

	let urlParams = new URLSearchParams(window.location.search);
	let myParam = urlParams.get('code');
	if(myParam)
	{
		this.myParam = myParam;
		this.authback(myParam);
	}
  }

});



</script>

<style lang="scss" scoped>

.login {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		align-content: center;
		color: white;
}

//** variables
$background: #f5f6fa;
$text: #9c9c9c;
$input-bg-color: #fff;
$input-text-color: #a3a3a3;
$button-bg-color: #7f8ff4;
$button-text-color: #fff;

//** root
:root {
	background: $background;
	color: $text;
	font: 1rem "PT Sans", sans-serif;
}

html,
body,
.container {
	height: 100%;
}

a {
	color: inherit;
	
	&:hover {
		color: $button-bg-color;
	}
}

//** helper
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.uppercase {
	text-transform: uppercase;
}

//** button
.btn {
    display: inline-block;
    margin: .5rem .5rem 1rem .5rem;
    clear: both;
    font-family: inherit;
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
    text-transform: initial;
    border: none;
    border-radius: .2rem;
    outline: none;
    padding: 0 1rem;
    height: 36px;
    line-height: 36px;
    color: #fff;
    transition: all 0.2s ease-in-out;
    box-sizing: border-box;
    background: black;
    border-color: red;
    cursor: pointer;
}

//** form
.form {	
	&__field {
		width: 360px;
		background: #fff;
		color: $input-text-color;
		font: inherit;
		box-shadow: 0 6px 10px 0 rgba(0, 0, 0 , .1);
		border: 0;
		outline: 0;
		padding: 22px 18px;
	}
}
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
  font-size: 500%;
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

@keyframes glowing-button-85 {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

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