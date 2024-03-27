import { IsPositive } from 'class-validator';

export class HealDto {
  @IsPositive()
  amount: number;
}
