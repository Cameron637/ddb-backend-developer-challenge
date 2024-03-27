import { Type } from 'class-transformer';
import { IsArray, IsIn, IsPositive, ValidateNested } from 'class-validator';
import { DAMAGE_TYPES, type DamageType } from '../../constants';

class Damage {
  @IsPositive()
  amount: number;

  @IsIn(DAMAGE_TYPES)
  type: DamageType;
}

export class DealDamageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Damage)
  damage: Damage[];
}
