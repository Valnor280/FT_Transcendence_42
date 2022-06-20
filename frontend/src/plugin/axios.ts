import axios from 'axios';

let url: string = 'http://' + location.hostname + ':' + process.env.VUE_APP_BACKEND_PORT;
console.log(url);
const $axios = axios.create({ 
	baseURL: url,
headers: {
  'Accept': '*/*',
}});

export default $axios;