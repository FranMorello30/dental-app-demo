import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/modules/auth/auth.module';

import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  imports: [AuthModule, ConfigModule, CommonModule],
})
export class UploadsModule {}
