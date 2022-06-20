import axios from 'axios';

const $axios = axios.create({ 
	baseURL: '',
headers: {
  'Accept': '*/*',
}});

export default $axios;