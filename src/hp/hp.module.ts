import { Module } from '@nestjs/common';
import { HpController } from './hp.controller';
import { HpService } from './hp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Hp, HpSchema } from './schemas/hp.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Hp.name, schema: HpSchema }])],
  controllers: [HpController],
  providers: [HpService],
})
export class HpModule {}
