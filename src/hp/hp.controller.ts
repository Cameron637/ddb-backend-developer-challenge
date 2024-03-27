import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { HpService } from './hp.service';
import { CreateOrUpdateHpDto } from './dto/create-or-update-hp.dto';
import { DealDamageDto } from './dto/deal-damage.dto';
import { HealDto } from './dto/heal.dto';
import { AddTemporaryHitPointsDto } from './dto/add-temporary-hit-points.dto';

@Controller('hp')
export class HpController {
  constructor(private readonly hpService: HpService) {}

  @Put(':id')
  createOrUpdate(
    @Param('id') id: string,
    @Body() createOrUpdateHpDto: CreateOrUpdateHpDto,
  ) {
    return this.hpService.createOrUpdate(id, createOrUpdateHpDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.hpService.findById(id);
  }

  @Post(':id/deal-damage')
  @HttpCode(200)
  dealDamage(@Param('id') id: string, @Body() dealDamageDto: DealDamageDto) {
    return this.hpService.dealDamage(id, dealDamageDto);
  }

  @Post(':id/heal')
  @HttpCode(200)
  heal(@Param('id') id: string, @Body() healDto: HealDto) {
    return this.hpService.heal(id, healDto);
  }

  @Post(':id/add-temporary-hit-points')
  @HttpCode(200)
  addTemporaryHitPoints(
    @Param('id') id: string,
    @Body() addTemporaryHitPointsDto: AddTemporaryHitPointsDto,
  ) {
    return this.hpService.addTemporaryHitPoints(id, addTemporaryHitPointsDto);
  }
}
