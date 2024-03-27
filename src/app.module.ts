import { Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HpModule } from './hp/hp.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [MongooseModule.forRoot('mongodb://127.0.0.1'), HpModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AppModule {}
