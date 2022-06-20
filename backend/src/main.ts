import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Express } from 'express';
import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeormStore } from 'connect-typeorm';
import { constants } from 'buffer';
import { jwtConstants } from './auth/constant';

const port = process.env.PORT;


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', '*, Set-Cookie, Authorization, Content-Type, Range');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(
	  session({
		  name: 'NESTJS_SESSION_ID',
	  	secret: jwtConstants.secret,
	  	resave: false,
	  	saveUninitialized: false,
	  	cookie: {
			  maxAge: 14400000,
	  	},
  	}),
  );
  app.enableCors({
	  origin: '*',
	  exposedHeaders: 'Connection, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Set-Cookie, Test',
	  credentials: true,
  });
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(port);
}
bootstrap();
