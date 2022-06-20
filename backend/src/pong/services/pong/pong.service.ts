import { Inject, Injectable } from '@nestjs/common';
import {
  SubscribeMessage, WebSocketGateway, WebSocketServer,
  OnGatewayConnection, OnGatewayDisconnect,
  OnGatewayInit
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, Module } from '@nestjs/common';
import { AccountService } from 'src/account/services/account/account.service';

@Injectable()
export class PongService {

  role: { isleft: number, isright: number, isviewer: number } = { isleft: 0, isright: 0, isviewer: 0 };

  constructor() { };

  //set a serverside canva size for calculation
  readonly globalwidth: number = 1000;
  readonly globalheight: number = 1000;
  readonly board: {
	max_x_speed: number,
    width: number,
    height: number,
    ballr: number,
    playerw2: number,
    playerh2: number,
    leftplayerx: number,
    rightplayerx: number,
    sballw: number
    rebound_factor: number;
  } = {
		max_x_speed: this.globalwidth / 120,
      width: this.globalwidth,
      height: this.globalheight,
      ballr: this.globalwidth / 120,
      playerw2: this.globalwidth / 120,
      playerh2: (this.globalheight / 20) + 10,
      leftplayerx: this.globalwidth / 15,
      rightplayerx: this.globalwidth - this.globalwidth / 15, //- this.globalheight / 50,
      sballw: this.globalheight / 80,
      rebound_factor: 6,
    };

  private special: boolean = false;
  private noedge: boolean = false;
  public name: { leftname: string, rightname: string } = {
    leftname: '',
    rightname: '',
  }
  public roomid: number = 0;
  //game vars
  public data: { ballx: number, bally: number, rightplayery: number, leftplayery: number } = {
    ballx: this.board.width / 2,
    bally: this.board.height / 2,
    rightplayery: this.globalheight / 2,
    leftplayery: this.globalheight / 2
  };


  private scores: { leftscorecount: number, rightscorecount: number } = {
    leftscorecount: 0,
    rightscorecount: 0
  };

  //is a point being played
  private isplaying: number = 0;

  //ball speed
  private balls: { x: number, y: number } = {
    x: 3,
    y: 0
  }

  //special ball
  readonly specialball: { sballx: number, sbally: number } = {
    sballx: this.data.ballx,
    sbally: this.data.bally,
  };
  //specialball speed
  private specialballs: { x: number, y: number } = {
    x: -this.balls.x,
    y: -this.balls.y
  }

  //init socket
  server: Server;

  //     //disconnection
  //   //   handleDisconnect(client: Socket) {
  //   //    this.logger.log(`A user has disconnected: ${client.id}`);
  //   //    role.isleft = 0, role.isright = 0, role.isviewer = 0; //a changer
  //   //    this.isplaying = 0;
  //   //   }
  setspecial(isspecial: boolean) {
    this.special = isspecial;
  }
  setnoedge(isnoedge: boolean) {
    this.noedge = isnoedge;
  }
  setroles(leftplayerclient: Socket, rightplayerclient: Socket, leftname: string, rightname: string) {
    this.role.isleft = 1;
    leftplayerclient.emit('role', this.role);
    this.name.leftname = leftname;
    console.log(leftplayerclient.id + "im left");
    this.role.isright = 1;
    rightplayerclient.emit('role', this.role);
    this.name.rightname = rightname;
    console.log(rightplayerclient.id + "im right");
    console.log("" + this.roomid, "lolol")
  }
  setwatchrole(client: Socket) {
    if (this.role.isleft === 1 && this.role.isright === 1) {
      this.role.isviewer++;
      client.emit('role', this.role);
    }
  }

  leaveroom() {
    this.server.in(this.roomid.toString()).socketsLeave(this.roomid.toString());
  }

  getscores() {
    return this.scores;
  }

  //game loop
  updateloop() {
    if (this.isplaying == 1) {
      // this.server.emit('moveplayers', this.data);
      this.server.to(this.roomid.toString()).emit('moveplayers', this.data);
      this.moveball();
      if (this.special === true) {
        this.server.to(this.roomid.toString()).emit('movespecialball', this.specialball);
        this.movespecialball();
      }
      setTimeout(this.updateloop.bind(this), 10);

    }
  };

  //handle point start
  handlestartGame(server: Server): void {

    //set server var;
    this.server = server;
    console.log("my room id is", this.roomid)
    server.to(this.roomid.toString()).emit('startGame', this.roomid);
    console.log(this.roomid, "lolol1")
    this.isplaying = 1;
    this.scores.leftscorecount = 0;
    this.scores.rightscorecount = 0;
    if (this.noedge === true)
      this.board.rebound_factor = 9;
    console.log("start game");
    this.updatescores();
    if (this.special === true) {
      console.log('yolo');
      server.to(this.roomid.toString()).emit('specialmode', this.roomid);
    }
    this.updateloop();
  };

  //handle point stop
  stopgame() {
    this.server.to(this.roomid.toString()).emit('moveplayers', this.data);
    console.log("stop");

	let text;
    if (this.scores.leftscorecount === 11) {
      this.server.to(this.roomid.toString()).emit('stop', 'left');
      text = 'Winner :' + this.name.leftname;
    }
    else {
      this.server.to(this.roomid.toString()).emit('stop', 'right');
      text = 'Winner :' + this.name.rightname;
    }
    this.server.to(this.roomid.toString()).emit('hardstop', text);
    this.isplaying = 0;
    console.log("stop game");
  };

  //handle point pause
  pausegame() {
    this.isplaying = 0;
    this.server.to(this.roomid.toString()).emit('pausetext');
  };

  //handle point play after pause
  handleplaygame() {
    this.isplaying = 1;
    console.log("lol");
    this.updateloop();
    this.server.to(this.roomid.toString()).emit('playtext');
  };

  // //receive right player position
  rightOn(rightplayerpositiony: number) {
    this.data.rightplayery = rightplayerpositiony * this.globalheight;
    return null;
  };


  //receive left player position
  leftOn(leftplayerpositiony: number) {
    this.data.leftplayery = leftplayerpositiony * this.globalheight;
    return null;
  };

  //randomize ball direction at start
  startball() {
    var maxspeed: number = 8; //set balll speed
    this.data.ballx = Math.random() * (maxspeed - 2) + 2;
    if (this.scores.leftscorecount <= this.scores.rightscorecount)
      this.data.ballx *= -1;
    this.balls.y = Math.random() * maxspeed;
    this.balls.y *= Math.round(Math.random()) ? 1 : -1;
    if (this.special === true) {
      this.specialballs.y = -this.balls.y;
      this.specialballs.x = -this.balls.x;
    }
  }

  //send scores
  updatescores() {
    //  this.server.emit('scores', this.scores);
    this.server.to(this.roomid.toString()).emit('scores', this.scores);
  };

  moveball() {
    //right and left bound
    if (this.data.ballx > this.board.width) {
      this.data.ballx = this.board.width / 2;
      this.data.bally = this.board.height / 2;
      this.balls.y = Math.floor(Math.random() * 12) - 6;
      this.scores.leftscorecount += 1;
      this.updatescores();
	  this.balls.x = 3;
      if (this.scores.leftscorecount == 11)
        this.stopgame();
      //update ball x and y position
      this.data.ballx += this.balls.x;
      this.data.bally += this.balls.y;
    }
    else if (this.data.ballx < 0) {
      this.data.ballx = this.board.width / 2;
      this.data.bally = this.board.height / 2;
      this.balls.y = Math.floor(Math.random() * 12) - 6;
      this.scores.rightscorecount += 1;
      this.updatescores();
	  this.balls.x = -3;
      if (this.scores.rightscorecount == 11)
        this.stopgame();

      //update ball x and y position
      this.data.ballx += this.balls.x;
      this.data.bally += this.balls.y;
    }
    //left player bound
    else if ((this.data.ballx - this.board.ballr + this.balls.x < this.board.leftplayerx + this.board.playerw2)
      && (this.data.ballx - this.board.ballr + this.balls.x > this.board.leftplayerx - this.board.playerw2)
      && (this.data.bally + this.board.ballr > this.data.leftplayery - this.board.playerh2)
      && (this.data.bally - this.board.ballr < this.data.leftplayery + this.board.playerh2)) {

      this.balls.x = -(this.balls.x * 1.02);
	  if (Math.abs(this.balls.x) > this.board.max_x_speed)
	{
		this.balls.x = this.board.max_x_speed;
	}
      let old_dy: number = this.balls.y;
      let old_dy_percentage: number = Math.abs((this.data.ballx - (this.board.leftplayerx + this.board.playerw2 + this.board.ballr)) / this.balls.x);
      this.balls.y = (this.data.bally - this.data.leftplayery) / (this.board.playerh2) * this.board.rebound_factor; //a remplacer par maxspeed
      //update ball x and y position
      this.data.ballx = this.board.leftplayerx + this.board.playerw2 + (this.balls.x * (1 - old_dy_percentage)) + this.board.ballr;
      this.data.bally += (old_dy * old_dy_percentage) + (this.balls.y * (1 - old_dy_percentage));
    }

    //right player bound 
    else if ((this.data.ballx + this.board.ballr + this.balls.x > this.board.rightplayerx - this.board.playerw2)
      && (this.data.ballx + this.board.ballr + this.balls.x < this.board.rightplayerx + this.board.playerw2)
      && (this.data.bally + this.board.ballr > this.data.rightplayery - this.board.playerh2)
      && (this.data.bally - this.board.ballr < this.data.rightplayery + this.board.playerh2)) {

      let old_dy_percentage: number = Math.abs(((this.board.rightplayerx - this.board.playerw2 - this.board.ballr) - this.data.ballx) / this.balls.x);
      this.balls.x = -(this.balls.x * 1.02);
	  if (Math.abs(this.balls.x) > this.board.max_x_speed)
	{
		this.balls.x = -(this.board.max_x_speed);
	}
      let old_dy: number = this.balls.y;
      this.balls.y = (this.data.bally - this.data.rightplayery) / (this.board.playerh2) * this.board.rebound_factor; //remplacer par maxspeed
      //update ball x and y position
      this.data.ballx = this.board.rightplayerx - this.board.playerw2 + (this.balls.x * (1 - old_dy_percentage)) - this.board.ballr;
      this.data.bally += (old_dy * old_dy_percentage) + (this.balls.y * (1 - old_dy_percentage));
    }

    //ceiling collision
    else if (this.data.bally - this.board.ballr + this.balls.y < 0) {
      // ici on change le signe du vecteur vertical de mouvement avant d'updater la position parce qu'il passe en positif et ca nous aide pour les calculs de position juste apres

      let old_dy_percentage: number = Math.abs((this.data.bally - this.board.ballr) / this.balls.y);
      if (this.noedge === false) {
        this.balls.y = -this.balls.y;
        this.data.bally = (this.balls.y * (1 - old_dy_percentage)) + this.board.ballr;
      }
      else {
        this.data.bally = this.board.height - (this.balls.y * (1 - old_dy_percentage)) - this.board.ballr;
      }
      //update ball x and y position
      this.data.ballx += this.balls.x;
    }

    //floor collision
    else if (this.data.bally + this.board.ballr + this.balls.y > this.board.height) {
      //update ball x and y position
      this.data.ballx += this.balls.x;
      let old_dy_percentage: number = Math.abs((this.board.height - this.board.ballr - this.data.bally) / this.balls.y);
      if (this.noedge === false) {
        this.data.bally = this.board.height - (this.balls.y * (1 - old_dy_percentage)) - this.board.ballr;
        this.balls.y = -this.balls.y;
      }
      else {
        this.data.bally = (this.balls.y * (1 - old_dy_percentage)) + this.board.ballr;
      }

    }
    else {
      this.data.ballx += this.balls.x;
      this.data.bally += this.balls.y;
    }
  }

  movespecialball() {
    //right and left scores
    if (this.specialball.sballx > this.board.width) {
      this.specialball.sballx = this.board.width / 2;
      this.specialball.sbally = this.board.height / 2;
      this.specialballs.y = Math.floor(Math.random() * 20) - 10;
      this.scores.leftscorecount += 1;
      this.updatescores();
	  this.specialballs.x = 3;
      if (this.scores.leftscorecount == 11)
        this.stopgame();
      //update ball x and y position
      this.specialball.sballx += this.specialballs.x;
      this.specialball.sbally += this.specialballs.y;
    }

    else if (this.specialball.sballx < 0) {
      this.specialball.sballx = this.board.width / 2;
      this.specialball.sbally = this.board.height / 2;
      this.specialballs.y = Math.floor(Math.random() * 20) - 10;
      this.scores.rightscorecount += 1;
      this.updatescores();
	  this.specialballs.x = -3;
      if (this.scores.rightscorecount == 11)
        this.stopgame();
      //update ball x and y position
      this.specialball.sballx += this.specialballs.x;
      this.specialball.sbally += this.specialballs.y;
    }

    //left player bound
    else if ((this.specialball.sballx - this.board.ballr + this.specialballs.x < this.board.leftplayerx + this.board.playerw2)
      && (this.specialball.sballx - this.board.ballr + this.specialballs.x > this.board.leftplayerx - this.board.playerw2)
      && (this.specialball.sbally + this.board.ballr > this.data.leftplayery - this.board.playerh2)
      && (this.specialball.sbally - this.board.ballr < this.data.leftplayery + this.board.playerh2)) {

		this.specialballs.x = -(this.specialballs.x * 1.02);
		if (Math.abs(this.specialballs.x) > this.board.max_x_speed)
	  {
		  this.specialballs.x = -(this.board.max_x_speed);
	  }
      let old_dy: number = this.specialballs.y;
      let old_dy_percentage: number = Math.abs((this.specialball.sballx - (this.board.leftplayerx + this.board.playerw2 + this.board.ballr)) / this.specialballs.x);
      this.specialballs.y = (this.specialball.sbally - this.data.leftplayery) / (this.board.playerh2) * 5; //a remplacer par maxspeed
      //update ball x and y position
      this.specialball.sballx = this.board.leftplayerx + this.board.playerw2 + (this.specialballs.x * (1 - old_dy_percentage)) + this.board.ballr;
      this.specialball.sbally += (old_dy * old_dy_percentage) + (this.specialballs.y * (1 - old_dy_percentage));
    }

    //right player bound 
    else if ((this.specialball.sballx + this.board.ballr + this.specialballs.x > this.board.rightplayerx - this.board.playerw2)
      && (this.specialball.sballx + this.board.ballr + this.specialballs.x < this.board.rightplayerx + this.board.playerw2)
      && (this.specialball.sbally + this.board.ballr > this.data.rightplayery - this.board.playerh2)
      && (this.specialball.sbally - this.board.ballr < this.data.rightplayery + this.board.playerh2)) {

      let old_dy_percentage: number = Math.abs(((this.board.rightplayerx - this.board.playerw2 - this.board.ballr) - this.specialball.sballx) / this.specialballs.x);
      this.specialballs.x = -(this.specialballs.x * 1.02);
	  if (Math.abs(this.specialballs.x) > this.board.max_x_speed)
	{
		this.specialballs.x = -(this.board.max_x_speed);
	}
      let old_dy: number = this.specialballs.y;
      this.specialballs.y = (this.specialball.sbally - this.data.rightplayery) / (this.board.playerh2) * 5; //remplacer par maxspeed
      //update ball x and y position
      this.specialball.sballx = this.board.rightplayerx - this.board.playerw2 + (this.specialballs.x * (1 - old_dy_percentage)) - this.board.ballr;
      this.specialball.sbally += (old_dy * old_dy_percentage) + (this.specialballs.y * (1 - old_dy_percentage));
    }

    //ceiling collision
    else if (this.specialball.sbally - this.board.ballr + this.specialballs.y < 0) {
      // ici on change le signe du vecteur vertical de mouvement avant d'updater la position parce qu'il passe en positif et ca nous aide pour les calculs de position juste apres
      this.specialballs.y = -this.specialballs.y;
      let old_dy_percentage: number = Math.abs((this.specialball.sbally - this.board.ballr) / this.specialballs.y);
      //update ball x and y position
      this.specialball.sballx += this.specialballs.x;
      this.specialball.sbally = (this.specialballs.y * (1 - old_dy_percentage)) + this.board.ballr;
    }

    //floor collision
    else if (this.specialball.sbally + this.board.ballr + this.specialballs.y > this.board.height) {
      //update ball x and y position
      this.specialball.sballx += this.specialballs.x;
      let old_dy_percentage: number = Math.abs((this.board.height - this.board.ballr - this.specialball.sbally) / this.specialballs.y);
      this.specialball.sbally = this.board.height - (this.specialballs.y * (1 - old_dy_percentage)) - this.board.ballr;
      //ici on change le signe du vecteur vertical de mouvement apres update de la position parce qu'il passe en negatif et ca nous aide pas pour les calculs
      this.specialballs.y = -this.specialballs.y;
    }
    else {
      this.specialball.sballx += this.specialballs.x;
      this.specialball.sbally += this.specialballs.y;
    }
  }

}


