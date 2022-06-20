import io, { Socket } from 'socket.io-client'

let url: string = 'http://' + location.hostname + ':' + process.env.VUE_APP_BACKEND_PORT;

let $socket = io(url, {
	transportOptions: {
	polling: { extraHeaders: {'Authorization': localStorage.getItem('user-token'), auth: localStorage.getItem('user-token')} },
	}});


export default $socket