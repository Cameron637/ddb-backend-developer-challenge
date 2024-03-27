import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hp } from './schemas/hp.schema';
import type { Model } from 'mongoose';
import { CreateOrUpdateHpDto } from './dto/create-or-update-hp.dto';
import type { DamageType, DefenseType } from '../constants';
import { DealDamageDto } from './dto/deal-damage.dto';
import { HealDto } from './dto/heal.dto';
import { AddTemporaryHitPointsDto } from './dto/add-temporary-hit-points.dto';

@Injectable()
export class HpService {
  constructor(@InjectModel(Hp.name) private hpModel: Model<Hp>) {}

  createOrUpdate(id: string, createOrUpdateHpDto: CreateOrUpdateHpDto) {
    const createdHp = new this.hpModel({
      _id: id,
      total: createOrUpdateHpDto.hitPoints,
      current: createOrUpdateHpDto.hitPoints,
      defenses: createOrUpdateHpDto.defenses.reduce(
        (defenses: Record<DamageType, DefenseType>, { type, defense }) => {
          if (
            !defenses[type] ||
            (defenses[type] === 'resistance' && defense === 'immunity')
          ) {
            defenses[type] = defense;
          }

          return defenses;
        },
        {} as Record<DamageType, DefenseType>,
      ),
    });

    return createdHp.save();
  }

  async findById(id: string) {
    const hp = await this.hpModel.findById(id);
    if (!hp) throw new NotFoundException();
    return hp;
  }

  async dealDamage(id: string, dealDamageDto: DealDamageDto) {
    const hp = await this.findById(id);

    dealDamageDto.damage.forEach(({ amount, type }) => {
      switch (hp.defenses[type]) {
        case 'immunity':
          return;
        case 'resistance':
          return this.subtractFromHp(hp, Math.floor(amount / 2));
        default:
          return this.subtractFromHp(hp, amount);
      }
    });

    return hp.save();
  }

  async heal(id: string, healDto: HealDto) {
    const hp = await this.findById(id);
    hp.current = Math.min(hp.current + healDto.amount, hp.total);
    return hp.save();
  }

  async addTemporaryHitPoints(
    id: string,
    addTemporaryHitPointsDto: AddTemporaryHitPointsDto,
  ) {
    const hp = await this.findById(id);
    hp.temporary = Math.max(addTemporaryHitPointsDto.amount, hp.temporary);
    return hp.save();
  }

  private subtractFromHp(hp: Hp, amount: number) {
    const tempResult = this.subtractFromHpPool(hp.temporary, amount);
    hp.temporary = tempResult.pool;
    const result = this.subtractFromHpPool(hp.current, tempResult.remainder);
    hp.current = result.pool;
  }

  private subtractFromHpPool(pool: number, amount: number) {
    const result = pool - amount;

    return {
      pool: Math.max(result, 0),
      remainder: result < 0 ? Math.abs(result) : 0,
    };
  }
}
