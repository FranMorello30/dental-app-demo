import { Module } from '@nestjs/common';

import { CommonService } from './services/common.service';
import { ConfigModule } from '@nestjs/config';
import { Helpers } from './helpers/helpers';

@Module({
  providers: [CommonService, Helpers],
  exports: [CommonService, Helpers],
  imports: [ConfigModule],
})
export class CommonModule {}
