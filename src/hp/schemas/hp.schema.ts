import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { DamageType, DefenseType } from '../../constants';

export type HpDocument = HydratedDocument<Hp>;

@Schema()
export class Hp {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  current: number;

  @Prop({ default: 0 })
  temporary: number;

  @Prop({ default: {}, type: Object })
  defenses: Record<DamageType, DefenseType>;
}

export const HpSchema = SchemaFactory.createForClass(Hp);
