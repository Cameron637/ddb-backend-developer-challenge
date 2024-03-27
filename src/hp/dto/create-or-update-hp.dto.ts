import { Type } from 'class-transformer';
import { IsArray, IsIn, IsPositive, ValidateNested } from 'class-validator';

import {
  DAMAGE_TYPES,
  DEFENSE_TYPES,
  type DamageType,
  type DefenseType,
} from '../../constants';

class Defense {
  @IsIn(DAMAGE_TYPES)
  type: DamageType;

  @IsIn(DEFENSE_TYPES)
  defense: DefenseType;
}

export class CreateOrUpdateHpDto {
  @IsPositive()
  hitPoints: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Defense)
  defenses: Defense[];
}
