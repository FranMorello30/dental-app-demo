import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket-ws.gateway';
import { SocketService } from './socket-ws.service';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
    AuthModule,
  ],
  providers: [SocketGateway, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
