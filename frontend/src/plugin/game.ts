import { def } from '@vue/shared';
import * as PIXI from 'pixi.js'

let elem;
if(document.getElementById('my-canvas-wrapper') != null)
{
	console.log('test');
	 elem = document.getElementById('my-canvas-wrapper');
}
else
{
	elem = window;
}

const board = new PIXI.Application({
	// width: window.innerWidth,
	//height: window.innerHeight - 300,
	resizeTo: window,
	//autoResize: true,
	// antialias: true,
	})

export default board;