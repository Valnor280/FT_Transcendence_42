import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { AccountService } from 'src/account/services/account/account.service';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { PongController } from './controllers/pong/pong.controller';
import { PongService } from './services/pong/pong.service';

@Module({
	imports: [AccountModule],
  controllers: [PongController],
  providers: [PongService,]
})
export class PongModule {}
