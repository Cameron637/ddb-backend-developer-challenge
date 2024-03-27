import { IsPositive } from 'class-validator';

export class AddTemporaryHitPointsDto {
  @IsPositive()
  amount: number;
}
