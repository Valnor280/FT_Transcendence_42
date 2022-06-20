
<template>
  <div id="my-canvas-wrapper">
    <!-- <button @click="reload">Test</button> -->
    <!-- <canvas class="my-canvas" ref="my-canvas"  width="320" height="440" style="border: 1px solid black;"></canvas>
    <slot></slot> -->
    <!-- <div ref="thistime"></div> -->
  </div>
</template>

 <script lang="ts">
	import * as PIXI from 'pixi.js'
	import $socket from '../plugin/socket'
	import { defineComponent, watch } from 'vue'
import { useToast } from 'vue-toastification'

export default defineComponent({
  props: ["roomid", "lname", "rname", "gamekey", "boardexist"],
  watch: {
    boardexist: function (newVal, oldVal) {
      // watch it
      //console.log("Prop changed: ", newVal, " | was: ", oldVal);
      document.querySelector("#my-canvas-wrapper")?.remove();
    },
  },
  name: "Game",
  data() {
    return {
      active: true,
    };
  },
  methods: {
    reload() {
      this.$forceUpdate();
    },

    Game() {
      if (this.active === true) {
		
		const toast = useToast();
        const board: any = new PIXI.Application({
          width: window.innerWidth,
          height: window.innerHeight - 300,
          resizeTo: window,
          //autoResize: true,
        });
        var background = PIXI.Sprite.from("/terre_espace-compressed.jpg");
        background.scale.x = board.view.width / 1000;
        background.scale.y = background.scale.x;
        background.anchor.set(0.5, 0.5);
        background.x = board.view.width / 2;
        background.y = board.view.height / 2;
        board.stage.addChild(background);
        background.alpha = 0;
        const container = new PIXI.Container();
        board.stage.addChild(container);

        //crazy mode
        var timmy: any;
        var dude: any;
        function cmode() {
          // background
          background.alpha = 1;
          dude = PIXI.Texture.from("/rocket-compressed.png");
          timmy = new PIXI.Sprite(dude);
          timmy.anchor.set(0.5, 0.4);
          timmy.x = board.view.width / 4;
          timmy.y = board.view.height / 4;
          timmy.scale.set(board.view.height / 1000, board.view.height / 1000);
          container.addChild(timmy);

          container.x = board.view.width / 2;
          container.y = board.view.height / 4;
          container.pivot.x = container.width / 2;
          container.pivot.y = container.height / 2;

          //loop
          board.ticker.add((delta: number) => {
            if (gamestarted) {
              container.alpha = 0;
            } else {
              container.alpha = 1;
              container.rotation -= 0.01 * delta;
              container.y = mouse.y;
            }
          });
        }

        //game
        var gamestarted: boolean = false;
        var pause: number = 0;
        var iscrazy: number = 0;
        var leftscorecount: number = 0;
        var rightscorecount: number = 0;

        //start text
        const style = new PIXI.TextStyle({
          fontFamily: "Arial",
          fontSize: 36,
          align: "center",
          fontWeight: "bold",
          fill: ["#ffffff", "#00ff00"], // gradient
          stroke: "#0000ff",
          strokeThickness: 5,
          dropShadow: true,
          dropShadowColor: "#000000",
          dropShadowBlur: 0,
          dropShadowAngle: Math.PI / 6,
          dropShadowDistance: 6,
          wordWrap: true,
          wordWrapWidth: 440,
        });
        const startext: any = new PIXI.Text("Click to start game", style);
        startext.x = board.view.width / 2 - startext.width / 2;
        startext.y = board.view.height / 4;
        board.stage.addChild(startext);
        startext.interactive = true;

        //init communication with server
        let socket = $socket;

        //checkrole
        var myrole: string = "n";
        var playertext: any;
        socket.on("role", (role) => {
          if (this.active === true) {
            //console.log("recu role in gme.vue", this.active);
            // console.log("recu role", role.isleft, role.isright);
            if (role.isleft === 1 && role.isright === 0) {
              //console.log("im left");
              myrole = "left";
            } else if (
              role.isleft === 1 &&
              role.isright === 1 &&
              role.isviewer === 0
            ) {
              //console.log("im right");
              myrole = "right";
            } else if (
              role.isleft === 1 &&
              role.isright === 1 &&
              role.isviewer > 0
            ) {
              //console.log("im viewer");
              myrole = "viewer";
              startext.text = "Waiting for players to start";
              pausetext.alpha = 0;
              rightscore.text = "leftscore : " + rightscorecount;
              leftscore.text = "rightscore : " + leftscorecount;
              cmodetext.x += cmodetext.width / 2;
            }
            playertext = new PIXI.Text(" as " + myrole + "player", style);
            if (myrole == "viewer") {
              playertext.text = " You are a spectator ";
            }
            playertext.x = board.view.width / 2 - playertext.width / 2;
            playertext.y = board.view.height / 2;
            board.stage.addChild(playertext);
            // playertext.interactive = true;
          }
        });

        //make interactive on click
        board.stage.interactive = true;
        board.stage.hitArea = board.renderer.screen;
        board.stage.addListener("click", (e: any) => {
          if (e.target === startext && myrole != "viewer" && this.active === true) {
            startext.alpha = 0;
			startext.interactive = false;
            playertext.alpha = 0;
            socket.emit("startGame", this.roomid);
            startext.text = "waiting for the other player";
          } else if (e.target == cmodetext) {
           // console.log("cli ", iscrazy);
            if (iscrazy == 0) {
              iscrazy = 1;
              cmodetext.text = "Normal mode ";
              cmode();
            } else if (iscrazy == 1) {
              iscrazy = 0;
              cmodetext.text = "Crazy mode ";
              background.alpha = 0;
              timmy.destroy(true);
              dude.destroy(true);
            }
          } else if (e.target === pausetext && gamestarted == true) {
            startext.alpha = 0;
			startext.interactive = false;
            // playertext.alpha = 0;
            if (pause == 0 && myrole != "viewer" && this.active === true) {
              pause = 1;
              pausetext.text = " Play";
              socket.emit("pause", this.roomid);
              startext.text = "Having a break";
              startext.alpha = 1;
			  startext.interactive = true;
            } else if (pause == 1 && myrole != "viewer" && this.active === true) {
              pause = 0;
              pausetext.text = " Pause";
              socket.emit("play", this.roomid);
              startext.alpha = 0;
			  startext.interactive = false;
            }
          }
        });

        socket.on("startGame", (data) => {
          if (this.active === true) {
            //console.log("recu startGame in game.vue", "width", board.view);
            // startext.alpha = 0;
            // playertext.alpha = 0;
            startgame();
          }
        });

        //score text style
        const scorestyle = new PIXI.TextStyle({
          fontFamily: "Arial",
          fontSize: 18,
          fill: ["#ffffff"], // gradient
          wordWrap: true,
          wordWrapWidth: 440,
        });

        //leftscore
        const leftscore = new PIXI.Text(
          this.lname + " : " + leftscorecount,
          scorestyle
        );
        leftscore.x = board.view.width / 3;
        leftscore.y = board.view.height / 50;
        leftscore.style.fontSize = (1 * board.view.width) / 60;
        // if (leftscore.style.fontSize < 10) {
        //   leftscore.scale.x = 2;
        //   leftscore.scale.y = 2;
        //   leftscore.resolution = 2;
        // }
        board.stage.addChild(leftscore);
        //rightscore
        const rightscore = new PIXI.Text(
          this.rname + " : " + rightscorecount,
          scorestyle
        );
        rightscore.x =
          board.view.width - rightscore.width - board.view.width / 3;
        rightscore.y = board.view.height / 50;
        rightscore.style.fontSize = (1 * board.view.width) / 60;
        // if (rightscore.style.fontSize < 10) {
        //   rightscore.scale.x = 2;
        //   rightscore.scale.y = 2;
        //   rightscore.resolution = 2;
        //   rightscore.x -= rightscore.width;
        // }
        board.stage.addChild(rightscore);

        //crazy mode button
        var cmodetext: any;
        cmodetext = new PIXI.Text("Crazy mode ", scorestyle);
        cmodetext.x =
          board.view.width / 2 - cmodetext.width - cmodetext.width / 10;
        cmodetext.y = board.view.height / 50;
        board.stage.addChild(cmodetext);
        cmodetext.interactive = true;

        //pause button
        var pausetext: any;
        pausetext = new PIXI.Text(" Pause", scorestyle);
        //pausetext.x = board.view.width / 2;
        //pausetext.y = board.view.height / 50;
        //board.stage.addChild(pausetext);
        //pausetext.interactive = true;
		// if(board.view.height > board.view. width){
			  cmodetext.y = board.view.height - board.view.height / 50 - cmodetext.height;
			  //pausetext.y = board.view.height - board.view.height / 50 - pausetext.height; 
		// }

        // updatescores
        socket.on("scores", (scores) => {
          if (this.active === true) {
            console.log("recu scores in game.vue");
            rightscorecount = scores.rightscorecount;
            leftscorecount = scores.leftscorecount;
            // console.log("recu scores", scores, leftscorecount, rightscorecount);
            if (myrole == "left") {
              rightscore.text = this.rname + " : " + rightscorecount;
              leftscore.text = this.lname + " : " + leftscorecount;
            } else if (myrole == "right") {
              rightscore.text = this.rname + " : " + rightscorecount;
              leftscore.text = this.lname + " : " + leftscorecount;
            } else if (myrole == "viewer") {
              rightscore.text = "Rightplayer score is : " + rightscorecount;
              leftscore.text = "Leftplayer score is : " + leftscorecount;
            }
          }
        });

        function startgame() {
          startext.alpha = 0;
		  startext.interactive = false;
          playertext.alpha = 0;
          gamestarted = true;
          leftscorecount = 0;
          rightscorecount = 0;
          rightscore.text = "My partner score is : " + leftscorecount;
          leftscore.text = "My score is : " + rightscorecount;
          pause = 0;
          pausetext.text = " Pause";
        }

        //listen for stop game event
        socket.on("stop", (resp) => {
          if (this.active === true) {
           // console.log("recu stop in game.vue");
			// if(resp === "left")
            //     toast.info('Winner : ' + this.lname);
            // else
            //     toast.info('Winner : ' + this.rname);
            stopgame();
            if (resp === myrole) $socket.emit("stop", this.roomid);
          }
        });

        // //listen for pause game event
        // socket.on("pausetext", () => {
        //   if (this.active === true) {
        //     console.log("recu pausetext in game.vue");
        //     pausetext.text = " Play";
        //     startext.text = "Having a break";
        //     startext.alpha = 1;
        //   }
        // });

        // //listen for play game event
        // socket.on("playtext", () => {
        //   if (this.active === true) {
        //     console.log("recu playtext in game.vue");
        //     pausetext.text = " Pause";
        //     startext.alpha = 0;
        //   }
        // });

        //listen for diconnection from server
        socket.on("disconnect", () => {
          if (this.active === true) {
            //console.log("recu disconnect in game.vue");
            startext.text = "         Game over         ";
            startext.alpha = 1;
			startext.interactive = true;
            playertext.alpha = 0;
          }
        });

        function stopgame() {
          gamestarted = false;
          if (
            (leftscorecount > rightscorecount && myrole == "left") ||
            (leftscorecount < rightscorecount && myrole == "right")
          )
            startext.text = "Congrats: You win";
          else if (
            (leftscorecount < rightscorecount && myrole == "left") ||
            (leftscorecount > rightscorecount && myrole == "right")
          )
            startext.text = "Shame: You loose";
          else if (
            leftscorecount == rightscorecount &&
            (myrole == "left" || myrole == "right")
          )
            startext.text = "Equality: please finish him next time";
          else if (myrole == "viewer") {
            if (leftscorecount > rightscorecount) {
              startext.text = "Left player won";
            } else if (leftscorecount < rightscorecount) {
              startext.text = "Right player won";
            } else {
              startext.text = "Equality: players are boring";
            }
          }
          startext.alpha = 1;
		  startext.interactive = true;
        }

        //create sprites
        function createball(color: number) {
          var b = new PIXI.Graphics();
          b.beginFill(color);
          b.drawCircle(0, 0, board.view.width / 60);
          b.endFill();
          return b;
        }

        function createplayer(color: any) {
          var width = board.view.width / 60;
          var height = board.view.height / 10;
          var player = new PIXI.Graphics();
          player.beginFill(color);
          player.drawRect(-width / 2, -height / 2, width, height);
          player.endFill();
          return player;
        }

        //ball
        const ball = createball(0x0000ff);
        board.stage.addChild(ball);
        ball.x = board.view.width / 2;
        ball.y = board.view.height / 2;
		//ball correction for large ratios
		if(board.view.width > board.view.height){
		  ball.width = board.view.width / 60;
          ball.height = board.view.width / 60;
		}

        //current player
        const leftplayer = createplayer(0x00ff00);
        leftplayer.x = board.view.width / 15;
        leftplayer.y = board.view.height / 2;
        board.stage.addChild(leftplayer);

        //partner player
        const rightplayer = createplayer(0xffffff);
        rightplayer.x = board.view.width - board.view.width / 15; // - (rightplayer.width);
        rightplayer.y = board.view.height / 2;
        board.stage.addChild(rightplayer);

        //get mouse position
        let mouse = { x: 0, y: 0 };
        var lastmouse = { y: 0 };
        const handleMouse = (event: any) => {
          let { x, y } = event.data.global;
          mouse = { x, y };
          var lastmouse = { x: 0, y: 0 };
          if (lastmouse.y != mouse.y) {
            leftplayerpos();
          }
          lastmouse.y = mouse.y;
        };
        board.renderer.plugins.interaction.on("mousemove", handleMouse);

        //update left player position
        const leftplayerpos = () => {
          let newY = mouse.y;
          newY = Math.max(newY, board.screen.height / 10 / 2);
          newY = Math.min(
            newY,
            board.screen.height - board.screen.height / 10 / 2
          );
          if (myrole == "right" && this.active === true)
            socket.emit("updateright", {
              rightplayerpositiony: newY / board.view.height,
              rid: this.roomid,
            });
          else if (myrole == "left" && this.active === true)
            socket.emit("updateleft", {
              leftplayerpositiony: newY / board.view.height,
              rid: this.roomid,
            });
        };

        //listen for ball and players position
        socket.on("moveplayers", (data) => {
          if (this.active === true) {
            leftplayer.position.y =
              (data.leftplayery / 1000) * board.view.height;
            rightplayer.position.y =
              (data.rightplayery / 1000) * board.view.height;
            ball.x = board.view.width * (data.ballx / 1000);
            ball.y = (data.bally / 1000) * board.view.height;
            if (myrole === "viewer") {
              startext.alpha = 0;
			  startext.interactive = false;
              playertext.alpha = 0;
            }
          }
        });
        var specialball: any;
        socket.on("specialmode", (data) => {
          if (this.active === true) {
            //console.log("recu specialmode in game.vue");
            // startext.alpha = 0;
            // playertext.alpha = 0;
            specialball = createball(0xdeb887);
            board.stage.addChild(specialball);
            specialball.x = board.view.width / 2;
            specialball.y = board.view.height / 2;
			specialball.width = board.view.height / 60;
          	specialball.height = board.view.height / 60;
			if(board.view.width > board.view.height){
		  		specialball.width = board.view.width / 60;
          		specialball.height = board.view.width / 60;
          }
        }});

        socket.on("movespecialball", (data) => {
          if (this.active === true) {
			if(!specialball)
            {
                specialball = createball(0xDEB887);
                board.stage.addChild(specialball)
                specialball.x = board.view.width / 2;
                specialball.y = board.view.height / 2;
				if(board.view.width > board.view.height){
		  		specialball.width = board.view.width / 60;
          		specialball.height = board.view.width / 60;
          	}
            }
            specialball.x = (data.sballx / 1000) * board.view.width;
            specialball.y = (data.sbally / 1000) * board.view.height;
          }
        });

        background.cacheAsBitmap = true;
        board.renderer.autoDensity = false;
        if (document.querySelector("#my-canvas-wrapper") != null)
          document.querySelector("#my-canvas-wrapper")?.appendChild(board.view);

        board.resize(board.view.parentNode.width, board.view.parentNode.height);

        function endgame() {
          //console.log("recu hardstop in game.vue");
          // board.removeAllListeners;
          // gamestarted  = null;
          pause = 0;
          iscrazy = 0;
          // leftscorecount = 0;
          // rightscorecount = 0;
          // myrole  = null;
          // // playertext = null;
          // // cmodetext = null;
          // // pausetext = null;
          startext.destroy(true);
          ball.destroy(true);
          leftscore.destroy(true);
          rightscore.destroy(true);
          leftplayer.destroy(true);
          rightplayer.destroy(true);
          // // startext.destroy(true);
          pausetext.destroy(true);
          cmodetext.destroy(true);
          playertext.destroy(true);

          board.stage.destroy(true);
          board.stage = null;
          // document.querySelector("#my-canvas-wrapper")?.removeChild(board.view);
          // this.refs.gameCanvas.removeChild(this.renderer.view);
          // board.renderer.destroy(true);
          // board.renderer = null;
          board.destroy(true);
          // this.$forceUpdate();
        }
        socket.on("hardstop", (text) => {
          if (this.active === true) {
            //console.log("recu hardstop in game.vue");
            if (document.querySelector("#my-canvas-wrapper") != null) {
              const child =
                document.querySelector("#my-canvas-wrapper")?.lastChild;
              if (child != null && child != undefined)
                document
                  .querySelector("#my-canvas-wrapper")
                  ?.removeChild(child);
            }

            toast.info(text);
            this.active = false;
            window.removeEventListener("resize", timeoutresize);
          }
        });
        let timeout: any = false, // holder for timeout id
          delay = 250; // delay after event is "complete" to run callback

        window.addEventListener("resize", timeoutresize);

        function timeoutresize() {
          // clear the timeout
          clearTimeout(timeout);
          // start timing for event "completion"
          timeout = setTimeout(resize, delay);
        }

		function gcd(a: number, b: number): number {
    		if (b) {
    		    return gcd(b, a % b);
    		} else {
    		    return Math.abs(a);
    		}
      	};

        function resize() {
          // Get the p
          const parent = board.view.parentNode;

          // Resize the renderer
          board.renderer.resize(parent.clientWidth, parent.clientHeight);
          rightplayer.x = board.view.width - board.view.width / 15;
          leftplayer.x = board.view.width / 15;
          leftplayer.width = board.view.width / 60;
          leftplayer.height = board.view.height / 10;
          rightplayer.width = board.view.width / 60;
          rightplayer.height = board.view.height / 10;

          // if(board.view.width < 1500)
          // 	scorestyle.fontSize = 44;
		//standard
		if(board.view.width > board.view.height){
		  ball.width = board.view.width / 60;
          ball.height = board.view.width / 60;
			if(specialball)
		  {
			  specialball.width = board.view.width / 60;
        	  specialball.height = board.view.width / 60;
		  }
		}
		else {
		  ball.width = board.view.height / 60;
          ball.height = board.view.height / 60;
		  if(specialball)
		  {
			  specialball.width = board.view.height / 60;
        	  specialball.height = board.view.height / 60;
		  }
		}
		if(!gamestarted){
			ball.x = board.view.width / 2;
        	ball.y = board.view.height / 2;
			if(specialball)
		 	{
			  specialball.y = board.view.height / 2;
        	  specialball.x = board.view.height / 2;
		 	}
			playertext.x = board.view.width / 2 - playertext.width / 2;
            playertext.y = board.view.height / 2;
			leftplayer.x = board.view.width / 15;
        	leftplayer.y = board.view.height / 2;
			rightplayer.x = board.view.width - board.view.width / 15; // - (rightplayer.width);
        	rightplayer.y = board.view.height / 2;
		}

		//if not started remetrre a x y
          startext.x = board.view.width / 2 - startext.width / 2;
          startext.y = board.view.height / 4;
          playertext.x = board.view.width / 2 - playertext.width / 2;
          playertext.y = board.view.height / 2;
          //pausetext.x = board.view.width / 2;
          //pausetext.y = board.view.height / 50;
          cmodetext.x =
            board.view.width / 2 - cmodetext.width - cmodetext.width / 10;
          cmodetext.y = board.view.height / 50;
          leftscore.x = board.view.width / 3;
          leftscore.y = board.view.height / 50;
          rightscore.x =
            board.view.width - rightscore.width - board.view.width / 3;
          rightscore.y = board.view.height / 50;
		  //console.log(board.view.width);
		//   leftscore.text = "oooooooooo : 11";
		//   rightscore.text = "oooooooooo : 11";
		  leftscore.style.fontSize = (1 * board.view.width) / 60;
		  rightscore.style.fontSize = (1 * board.view.width) / 60;
		  cmodetext.style.fontSize = (1 * board.view.width) / 60;
		  //pausetext.style.fontSize = (1 * board.view.width) / 60;
		//   if(board.view.height > board.view. width){
			  cmodetext.y = board.view.height - board.view.height / 50 - cmodetext.height;
			  //pausetext.y = board.view.height - board.view.height / 50 - pausetext.height; 
		//   }
		//   if(board.view.width < 700)
		// 	cmodetext.text = "cm";
		// var divisor = 100;//gcd(board.view.width, board.view.height)
		// var ratiotop =  board.view.width / divisor;
		// var ratiobottom =  board.view.height / divisor;
		// console.log(ratiotop, ":", ratiobottom, board.view.height, board.view.width, divisor);
		  //4:3
		//   if(board.view.width)
          // You can use the 'screen' property as the renderer visible
          // area, this is more useful than view.width/height because
          // it handles resolution
          //rect.position.set(board.screen.width, app.screen.height);
        }
      }
    },
  },
  mounted() {
    //need to be behind a button and not on mounted
    console.log(document.querySelector("my-canvas-wrapper"));
    if (this.active === true) {
      this.Game();
    }
  },
});
</script>

<style scoped>
#my-canvas-wrapper {
  position: absolute;
}
</style>
